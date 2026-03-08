class YinPitchTracker {
    constructor(sampleRate, bufferSize, threshold = 0.1) {
        this.sampleRate = sampleRate;
        this.bufferSize = bufferSize;
        this.halfBufferSize = Math.floor(bufferSize / 2);
        this.yinBuffer = new Float32Array(this.halfBufferSize);
        this.threshold = threshold;
    }

    getPitch(buffer) {
        // 1. Difference Function
        for (let t = 0; t < this.halfBufferSize; t++) this.yinBuffer[t] = 0;
        for (let tau = 1; tau < this.halfBufferSize; tau++) {
            for (let i = 0; i < this.halfBufferSize; i++) {
                const delta = buffer[i] - buffer[i + tau];
                this.yinBuffer[tau] += delta * delta;
            }
        }
        // 2. Cumulative Mean Normalized Difference Function
        this.yinBuffer[0] = 1;
        let runningSum = 0;
        for (let tau = 1; tau < this.halfBufferSize; tau++) {
            runningSum += this.yinBuffer[tau];
            this.yinBuffer[tau] *= tau / runningSum;
        }
        // 3. Absolute Thresholding
        let tauEstimate = -1;
        for (let tau = 2; tau < this.halfBufferSize; tau++) {
            if (this.yinBuffer[tau] < this.threshold) {
                while (tau + 1 < this.halfBufferSize && this.yinBuffer[tau + 1] < this.yinBuffer[tau]) tau++;
                tauEstimate = tau;
                break;
            }
        }
        if (tauEstimate === -1) {
            let minVal = Infinity;
            for (let tau = 1; tau < this.halfBufferSize; tau++) {
                if (this.yinBuffer[tau] < minVal) {
                    minVal = this.yinBuffer[tau];
                    tauEstimate = tau;
                }
            }
            if (this.yinBuffer[tauEstimate] >= this.threshold) return -1;
        }
        // 4. Parabolic Interpolation
        let betterTau = tauEstimate;
        if (tauEstimate > 0 && tauEstimate < this.halfBufferSize - 1) {
            const s0 = this.yinBuffer[tauEstimate - 1];
            const s1 = this.yinBuffer[tauEstimate];
            const s2 = this.yinBuffer[tauEstimate + 1];
            betterTau += (s0 - s2) / (2 * (s0 - 2 * s1 + s2));
        }
        return this.sampleRate / betterTau;
    }
}

// AudioWorkletProcessorの実装
class YinProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.bufferSize = 2048;
        this.audioBuffer = new Float32Array(this.bufferSize);
        this.bufferIndex = 0;

        // sampleRateはグローバル変数としてWorklet内で利用可能です
        this.yin = new YinPitchTracker(sampleRate, this.bufferSize);
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        // 入力がない場合（マイクが繋がっていない等）はスキップ
        if (!input || !input[0]) return true;

        const channelData = input[0]; // モノラルとして扱う

        for (let i = 0; i < channelData.length; i++) {
            this.audioBuffer[this.bufferIndex++] = channelData[i];

            // バッファがいっぱいになったらYINアルゴリズムを実行
            if (this.bufferIndex >= this.bufferSize) {
                const pitch = this.yin.getPitch(this.audioBuffer);

                // 解析結果をメインスレッドに送信
                this.port.postMessage({ pitch: pitch });

                // バッファをリセット
                this.bufferIndex = 0;
            }
        }

        return true; // 処理を継続するためにtrueを返す
    }
}

// プロセッサを登録
registerProcessor("yin-processor", YinProcessor);
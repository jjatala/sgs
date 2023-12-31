import { AudioParamDescriptor, WorkletGeneratorParam } from './interfaces';
import { AudioWorkletProcessor } from './util';

export class GeneratorProcessor extends AudioWorkletProcessor {
  /**
   * TODO: description
   */
  public static get types(): string[] {
    return ['White noise', 'Red noise'];
  }

  /**
   * TODO: description
   */
  public static get key(): string {
    return 'generator-processor';
  }

  /**
   * TODO: description
   */
  public static get inputs(): number {
    return 0;
  }

  /**
   * TODO: description
   */
  public static get outputs(): number {
    return 1;
  }

  /**
   * TODO: description
   */
  public static get parameterDescriptors(): AudioParamDescriptor[] {
    return [
      {
        name: 'type',
        defaultValue: 0,
        minValue: 0,
        maxValue: 10,
        automationRate: 'k-rate',
      },
    ];
  }

  public stopped = false;

  /**
   * Constructor.
   */
  constructor() {
    super();

    const port: MessagePort = this['port'];
    if (port) {
      port.onmessage = (ev: MessageEvent) => this.onmessage(ev.data);
    }
  }

  /**
   * TODO: description
   */
  public onmessage(data: Record<string, any>) {
    console.log('onmessage', data);
    if (data.type === 'stop') {
      this.stopped = true;
    }
  }

  /**
   * TODO: description
   */
  public generate(type_: number, output: Float32Array) {
    if (type_ < 1) {
      for (let i = 0; i < output.length; ++i) {
        output[i] = Math.random() * 2 - 1;
      }
    } else if (type_ < 2) {
      let value: number = output[output.length - 1] || 0;
      for (let i = 0; i < output.length; ++i) {
        const white = Math.random() * 2 - 1;
        value = 0.95 * value + 0.05 * white;
        output[i] = value;
      }
    }
  }

  /**
   * TODO: description
   */
  public process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: AudioWorkletProcessorParmeters<WorkletGeneratorParam>
  ): boolean {
    try {
      if (this.stopped) {
        return false;
      }
      const type_ = parameters.type[0];
      const channels: Float32Array[] = outputs[0];
      for (let i = 0; i < channels.length; ++i) {
        this.generate(type_, channels[i]);
      }
    } catch (err) {
      console.error(err);
      return false;
    }
    return true;
  }
}

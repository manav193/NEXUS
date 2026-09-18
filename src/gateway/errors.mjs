export class NexusGatewayError extends Error {
  constructor(message, code = "GATEWAY_ERROR", cause = undefined) {
    super(message, { cause });
    this.name = "NexusGatewayError";
    this.code = code;
  }
}

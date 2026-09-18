# NEXUS Tool Gateway

The gateway is the hard boundary between policy evaluation and external side effects.

## Rule

**No adapter executes an action unless the gateway has produced ALLOW or an explicit approval has been supplied for REQUIRE_APPROVAL.**

DENY never reaches an adapter.

## Adapter contract

An adapter exposes:

```js
{
  async execute(action) {
    return result;
  }
}
```

Adapters receive a normalized action only after the gateway has made the authorization decision.

## Approval

Approval is a separate gateway input. Durable approval tokens, expiry, actor binding, and replay protection are deferred to the human-in-the-loop phase.

## Failure behavior

Adapter exceptions become a stable `NexusGatewayError` code. Internal exception details remain in `cause` and are not copied into the public message.

## Memory adapter

The memory adapter performs no external I/O. It exists to prove the execution boundary through automated tests.

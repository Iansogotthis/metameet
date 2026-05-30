# Meta Actions Entrypoints

## Core Entrypoints

### Primary Entry Points
- `action.initialize`: System initialization
- `action.execute`: Action execution
- `action.validate`: Input validation
- `action.complete`: Action completion

### Event Handlers
- `on.start`: Startup event
- `on.error`: Error handling
- `on.complete`: Completion callback
- `on.state_change`: State change listener

## Configuration

```json
{
  "entrypoints": {
    "meta_actions": {
      "initialize": "handlers/initialize",
      "execute": "handlers/execute",
      "validate": "handlers/validate",
      "complete": "handlers/complete"
    },
    "events": {
      "start": "handlers/events/start",
      "error": "handlers/events/error",
      "complete": "handlers/events/complete",
      "state_change": "handlers/events/state_change"
    }
  }
}
```

## Handler Registration

Each entrypoint must register its corresponding handler:

```javascript
registerEntrypoint('meta_actions.initialize', initializeHandler);
registerEntrypoint('meta_actions.execute', executeHandler);
registerEntrypoint('meta_actions.validate', validateHandler);
registerEntrypoint('meta_actions.complete', completeHandler);
```

## Usage

See individual handler documentation for usage examples.

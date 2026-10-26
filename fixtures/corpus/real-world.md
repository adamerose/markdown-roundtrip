# Project Name

[![Build Status](https://img.shields.io/badge/build-passing-green)](https://example.com)

A brief description of the project.

## Installation

```bash
npm install project-name
```

Or with yarn:

```bash
yarn add project-name
```

## Usage

```javascript
const { createClient } = require('project-name');

const client = createClient({
  apiKey: 'your-api-key',
  timeout: 5000,
});

const result = await client.query('test');
console.log(result);
```

## API Reference

### `createClient(options)`

Creates a new client instance.

**Parameters:**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `apiKey` | `string` | — | Your API key |
| `timeout` | `number` | `3000` | Request timeout in ms |
| `retries` | `number` | `3` | Number of retry attempts |

**Returns:** `Client` instance.

### `client.query(input)`

Executes a query.

**Parameters:**

- `input` (`string`) — The query string.

**Returns:** `Promise<Result>`

### `client.stop()`

Gracefully shuts down the client.

**Returns:** `Promise<void>`

## Configuration

Create a `.config.json` file in your project root:

```json
{
  "apiKey": "your-key-here",
  "debug": false,
  "output": "./dist"
}
```

> **Note:** Never commit your API key to version control.

## Error Handling

The library throws typed errors:

- `ConfigError` - Invalid configuration
- `ConnectionError` - Network issues
- `TimeoutError` - Request exceeded timeout

```javascript
try {
  await client.start();
} catch (err) {
  if (err instanceof ConfigError) {
    console.error('Bad config:', err.message);
  }
}
```

All errors return a JSON response with the following structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ]
  }
}
```

## Rate Limiting

- **Rate limit:** 100 requests per minute
- **Headers:** `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Exceeding the rate limit returns `429 Too Many Requests`

---

## Changelog

### [2.1.0] - 2024-03-15

#### Added

- New `createWidget` API for building custom components
- Support for dark mode via `theme.dark` configuration
- Keyboard shortcut `Ctrl+Shift+P` for command palette

#### Changed

- Improved performance of `renderTree()` by 40%
- Updated dependency `lodash` from 4.17.20 to 4.17.21

#### Fixed

- Fixed crash when opening empty files (#142)
- Fixed incorrect color rendering on high-DPI displays (#156)
- Fixed memory leak in `EventEmitter.removeListener()` (#163)

### [2.0.0] - 2024-01-10

#### Breaking Changes

- Minimum Node.js version is now 18.0
- Removed `config.legacy` option
- Changed default export to named export

#### Added

- TypeScript type definitions included in package
- New `Plugin` interface for extensibility:

```typescript
interface Plugin {
  name: string;
  init(app: App): void;
  destroy(): void;
}
```

#### Migration Guide

1. Update Node.js to 18.0 or later
2. Change import statements:

```javascript
// Before
const App = require('my-app');

// After
const { App } = require('my-app');
```

3. Remove any `config.legacy` usage
4. Test thoroughly

### [1.5.0] - 2023-11-01

#### Added

- Batch processing via `processAll(items)`:

| Parameter | Type | Description |
| --- | --- | --- |
| `items` | `Array<Item>` | Items to process |
| `options.parallel` | `boolean` | Run in parallel |
| `options.batchSize` | `number` | Items per batch |

---

## Feature Comparison

| Feature | Free | Pro | Enterprise |
| --- | :---: | :---: | :---: |
| API Access | 1K/mo | 100K/mo | Unlimited |
| Support | Community | Email | Dedicated |
| SSO |  | ✓ | ✓ |
| Audit Logs |  |  | ✓ |
| Custom Domain |  |  | ✓ |

## FAQ

**Q: How do I reset my password?**

A: Visit the [password reset page](https://example.com/reset) and enter your email address.

**Q: What browsers are supported?**

A: We support the latest versions of Chrome, Firefox, Safari, and Edge.

## Troubleshooting

### Error: `ECONNREFUSED`

This typically means the database is not running. Try:

```bash
docker-compose up -d postgres
npm run db:migrate
```

### Error: `JWT_SECRET not set`

Set the `JWT_SECRET` environment variable:

```bash
export JWT_SECRET="your-secret-key-here"
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

### Code Style

We use [Prettier](https://prettier.io) for formatting and [ESLint](https://eslint.org) for linting.

- Use **TypeScript** for all new code
- Follow the existing patterns in the codebase
- Write JSDoc comments for public APIs

## Security Checklist

- [x] Use HTTPS everywhere
- [x] Validate all input on the server side
- [x] Implement rate limiting
- [x] Use parameterized queries to prevent SQL injection
- [ ] Set up CORS policies
- [ ] Implement request signing for webhooks
- [ ] Add IP allowlisting for admin endpoints

## Links

- [Documentation](https://docs.example.com)
- [API Reference](https://api.example.com)
- [Issue Tracker](https://github.com/example/project/issues)
- [NPM Package](https://www.npmjs.com/package/project-name)

## Acknowledgments

Special thanks to:

- [React](https://reactjs.org/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Jest](https://jestjs.io/) - Testing framework

## License

MIT License. See [LICENSE](LICENSE) for details.

---

[2.1.0]: https://github.com/user/project/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/user/project/compare/v1.5.0...v2.0.0
[1.5.0]: https://github.com/user/project/releases/tag/v1.5.0

Made with **love** and *coffee*.

## Appendix: Extended Syntax Examples

### Strikethrough in Context

The ~~old API~~ has been replaced with the **new API**.

### Autolinks and Formatting

Visit **<https://docs.example.com>** or *<https://api.example.com>* for documentation.

### Code Span with Special Content

The `<template>` tag and `<style scoped>` are Vue-specific.

### Nested List with Task Items and Formatting

- [x] **Phase 1:** Core implementation
  - [x] Set up project structure
  - [x] Implement ~~basic~~ **complete** API
  - [ ] Write tests
- [ ] *Phase 2:* Documentation
  - [ ] API reference
  - [ ] Getting started guide

### Complex Real-World Blockquote

> **Warning:** This API is deprecated since [v2.0.0].
>
> Use [`newMethod()`](https://docs.example.com/new) instead.
>
> ```javascript
> // Old way (deprecated)
> client.oldMethod();
>
> // New way
> client.newMethod();
> ```
>
> See the [migration guide](https://docs.example.com/migrate) for details.

### Inline Code Adjacent to Links

Use `npm install` then visit [docs](https://example.com). The `config.json`[file](https://example.com/config) is required.

### Table with All Alignment Types and Formatting

| Method | Returns | Description |
| :--- | :---: | ---: |
| `start()` | `Promise<void>` | **Starts** the service |
| `stop()` | `Promise<void>` | *Stops* the service |
| `status()` | `string` | Returns ~~old~~ **new** status |

### Reference Links in Context

See [the API docs][api-doc] for `createClient` usage.

The [configuration guide][config-guide] explains all options.

For troubleshooting, check the [FAQ][faq-link].

[api-doc]: https://docs.example.com/api "API Documentation"
[config-guide]: https://docs.example.com/config
[faq-link]: https://docs.example.com/faq "Frequently Asked Questions"

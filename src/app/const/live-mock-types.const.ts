/**
 * TypeScript definitions for Live Mock runtime environment
 * These definitions provide intellisense support in the Monaco editor
 */

export const LIVE_MOCK_TYPE_DEFINITIONS = `
/**
 * URL query parameters object
 * Contains key-value pairs from the request URL query string
 */
declare const queryParams: { [key: string]: string | string[] };

/**
 * Complete request URL
 * The full URL of the incoming request
 */
declare const url: string;

/**
 * URL path parameters
 * Contains parameters extracted from the route path (e.g., /users/:id)
 */
declare const params: { [key: string]: string };

/**
 * Request headers
 * Contains all HTTP headers from the incoming request
 */
declare const headers: { [key: string]: string };

/**
 * Mock response content
 * The configured response content for this mock
 */
declare const content: any;

/**
 * Set the result of the live mock processing
 * @param result - The result object to return from the mock
 * @param result.value - The response value to return
 */
declare function setResult(result: { value: any }): void;
`;
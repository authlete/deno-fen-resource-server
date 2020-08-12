// Copyright (C) 2020 Authlete, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


import { okJson } from 'https://deno.land/x/authlete_deno@v1.2.0/mod.ts';
import { BaseResourceEndpoint } from './base_resource_endpoint.ts';


/**
 * An example of a protected resource endpoint. This implementation
 * returns JSON that contains information about the current time.
 */
export class TimeEndpoint extends BaseResourceEndpoint
{
    /**
     * API entry point for HTTP GET method. The request must contain
     * an access token. Below are usage examples.
     *
     * ```bash
     * # Passing an access token in the way defined in RFC 6750, 2.3.
     * # URI Query Parameter.
     * $ curl -v http://localhost:1903/api/time\?access_token={access_token}
     *
     * # Passing an access token in the way defined in RFC 6750, 2.1.
     * # Authorization Request Header Field.
     * $ curl -v http://localhost:1903/api/time \
     *        -H 'Authorization: Bearer {access_token}'
     * ```
     */
    public async get()
    {
        await this.process(
            async () => { return await this.handle(); }
        );
    }


    /**
     * API entry point for HTTP POST method. The request must contain
     * an access token. Below are examples.
     *
     * ```bash
     * # Passing an access token in the way defined in RFC 6750, 2.2.
     * # Form-Encoded Body Parameter.
     * $ curl -v http://localhost:1903/api/time \
     *        -d access_token={access_token}
     * ```
     *
     * ```bash
     * # Passing an access token in the way defined in RFC 6750, 2.1.
     * # Authorization Request Header Field.
     * $ curl -v -X POST http://localhost:1903/api/time \
     *        -H 'Content-Type: application/x-www-form-urlencoded' \
     *        -H 'Authorization: Bearer {access_token}'
     * ```
     */
    public async post()
    {
        await this.processForApplicationFormUrlEncoded(
            async () => { return await this.handle(); }
        );
    }


    private async handle()
    {
        // Extract an access token from the request and validate it.
        // The instance of 'AccessTokenValidator' returned from
        // validateAccessToken() method holds the result of the access
        // token validation.
        //
        // Note that validateAccessToken() can optionally take 'requiredScopes'
        // and 'requiredSubject' parameters although they are not used
        // in this example.
        const validator = await this.validateAccessToken();

        // If the access token is not valid.
        if (!validator.isValid)
        {
            // When the value of 'isValid' is false, 'errorResponse'
            // holds an error response that should be returned to the
            // client application. The response complies with RFC 6750
            // (The OAuth 2.0 Authorization Framework: Bearer Token Usage).
            //
            // You can refer to 'introspectionResult' or 'introspectionError'
            // for more information.
            return validator.errorResponse!;
        }

        // The access token is valid, so it's okay for this protected
        // resource endpoint to return the requested protected resource.

        // Generate a response specific to this protected resource endpoint
        // and return it to the client.
        return this.buildResponse();
    }


    private buildResponse()
    {
        // This simple example generates JSON that holds information
        // about the current time.

        // The current time in UTC.
        const now = new Date();

        // Build a result.
        const result = {
            'year':        now.getUTCFullYear(),
            'month':       now.getMonth() + 1,
            'day':         now.getUTCDate(),
            'hour':        now.getUTCHours(),
            'minute':      now.getUTCMinutes(),
            'second':      now.getUTCSeconds(),
            'millisecond': now.getUTCMilliseconds()
        };

        // Return a json response with 200 OK.
        return okJson( JSON.stringify(result) );
    }
}
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


import { Response } from 'https://deno.land/std@0.64.0/http/server.ts';
import {
    AccessTokenValidator, AuthleteApi, badRequest, ContentType,
    internalServerError, isNotEmpty
} from 'https://deno.land/x/authlete_deno@v1.2.0/mod.ts';
import { IContext } from 'https://deno.land/x/fen@v0.8.0/server.ts';


/**
 * A regular expression for extracting "Bearer {access_token}" in the
 * `Authorization` request header.
 */
const BEARER_PATTERN = /^Bearer\s*([^\s]+)\s*$/i;


/**
 * Execute a task.
 */
async function executeTask(task: () => Promise<Response>): Promise<Response>
{
    try
    {
        // Execute the task.
        return await task();
    }
    catch (e)
    {
        // Log the error.
        console.log(e);

        // Return a response of '500 Internal Server Error'.
        return internalServerError('Something went wrong.');
    }
}


/**
 * Append headers in the source headers object to the target headers object.
 */
function appendHeaders(targetHeaders: Headers, sourceHeaders?: Headers)
{
    if (sourceHeaders)
    {
        for (const e of sourceHeaders.entries())
        {
            targetHeaders.append(e[0], e[1]);
        }
    }
}


/**
 * Base endpoint.
 */
export class BaseResourceEndpoint
{
    /**
     * The implementation of `AuthleteApi` interface.
     */
    protected api: AuthleteApi;


    /**
     * The context
     */
    protected context: IContext;


    /**
     * The constructor.
     *
     * @params api
     *          An implementation of `AuthleteApi` interface.
     *
     * @param context
     *         A Fen's context object.
     */
    public constructor(api: AuthleteApi, context: IContext)
    {
        this.api = api;

        this.context = context;
    }


    /**
     * Process a task.
     *
     * @param task
     *         A task to be processed at this endpoint. The task must
     *         return a Promise containing an instance of Deno's standard
     *         `Response` class (defined in https://deno.land/std/http/server.ts).
     */
    protected async process(task: () => Promise<Response>): Promise<void>
    {
        // Execute the task and handle the resultant response.
        this.handleResponse( await executeTask(task) );
    }


    private async handleResponse(response: Response)
    {
        // Disable fen's respond.
        this.context.config.disableRespond = true;

        // Merge the headers object created by fen (= this.context.headers)
        // with the headers object obtained by executing the task (=
        // response.headers).
        this.setupResponseHeaders(response);

        // Send the response.
        this.getRequest().respond(response);
    }


    private setupResponseHeaders(response: Response)
    {
        // A new header object.
        const newHeaders = new Headers();

        // Append the headers in the context (created by Fen) to the
        // new headers object. The headers object can have a 'set-cookie'
        // header, which is set by Fen's session process.
        appendHeaders(newHeaders, this.context.headers);

        // Append the headers in the response (obtained by executing
        // the task) to the new headers object. The headers object should
        // have some essential headers such as 'content-type', 'cache-control'
        // and etc...
        appendHeaders(newHeaders, response.headers);

        // Set the new headers as the response headers.
        response.headers = newHeaders;
    }


    /**
     * Get the current request.
     *
     * This method returns the value returned by `this.context.request`;
     */
    protected getRequest()
    {
        return this.context.request;
    }


    /**
     * Get the query parameters of the current request.
     *
     * This method returns the value returned by `this.context.params`;
     */
    protected getQueryParameters()
    {
        return this.context.params;
    }


    /**
     * Get the request body as `{ [key: string]: string }`.
     *
     * This method returns the value returned by
     * `this.context.reqBody as { [key: string]: string }`;
     */
    protected getRequestBodyAsObject()
    {
        return this.context.reqBody as { [key: string]: string };
    }


    /**
     * Get the HTTP request method of the current request.
     *
     * This method returns the value returned by `this.getRequest().method`;
     */
    protected getRequestMethod()
    {
        return this.getRequest().method;
    }


    /**
     * Get the headers of the current request.
     *
     * This method returns the value returned by `this.getRequest().headers`;
     */
    protected getRequestHeaders()
    {
        return this.getRequest().headers;
    }


    /**
     * Get the value of the `Content-Type` request header.
     *
     * This method returns the value returned by `this.getRequestHeaders().get('Content-Type')`;
     */
    protected getRequestContentType()
    {
        return this.getRequestHeaders().get('Content-Type');
    }


    /**
     * Get the value of the `Authorization` request header.
     *
     * This method returns the value returned by `this.getRequestHeaders().get('Authorization')`;
     */
    protected getAuthorization()
    {
        return this.getRequestHeaders().get('Authorization');
    }


    /**
     * Execute a task after ensuring that the value of the `Content-Type`
     * request header is `application/x-www-form-urlencoded`.
     *
     * If the content type is wrong, a response of `'400 BadRequest'`
     * is returned to the end-user.
     */
    protected async processForApplicationFormUrlEncoded(task: () => Promise<Response>)
    {
        await this.processForContentType(ContentType.APPLICATION_FORM_URLENCODED, task);
    }


    /**
     * Execute a task after ensuring that the content type of the request
     * is the target one.
     *
     * If the content type is wrong, a response of `'400 BadRequest'`
     * is returned to the end-user.
     */
    private async processForContentType(type: string, task: () => Promise<Response>)
    {
        await this.process(async () => {
            // Check the request content type.
            if (this.getRequestContentType() !== type)
            {
                return badRequest(`Request 'Content-Type' must be '${type}'.`);
            }

            // Then, execute the task.
            return await task();
        });
    }


    /**
     * Extract an access token from the request based on RFC 6750.
     */
    protected extractAccessToken()
    {
        // Check 1. RFC 6750, 2.1. Authorization Request Header Field.
        const authorization = this.getAuthorization();

        if (isNotEmpty(authorization))
        {
            // Check if the value of the 'Authorization' header matches
            // the pattern, "Bearer {access_token}".
            const result = BEARER_PATTERN.exec(authorization!);

            // If it matched the pattern, extract an access token value.
            if (result !== null) return result[1];
        }

        // Check 2. RFC 6750, 2.3. URI Query Parameter.
        if (this.getRequestMethod() === 'GET')
        {
            return this.getQueryParameters().get('access_token');
        }

        // Check 3. RFC 6750, 2.2. Form-Encoded Body Parameter.
        if (this.getRequestContentType() === ContentType.APPLICATION_FORM_URLENCODED)
        {
            return this.getRequestBodyAsObject()['access_token'];
        }
    }


    /**
     * Validate the access token. This method extracts an access token
     * from the request and then validates the access token by calling
     * `validate()` method of `AccessTokenValidator`.
     *
     * @param requiredScopes
     *         Scopes that the access token should cover. If a non-empty
     *         value is given to this parameter, Authlete `/api/auth/introspection`
     *         API checks whether the access token covers all the required
     *         scopes.
     *
     * @param requestedSubject
     *         Subject (= unique identifier of an end-user) that the
     *         access token should be associated with. If a non-empty
     *         value is given to this parameter, Authlete `/api/auth/introspection`
     *         API checks whether the access token is associated with
     *         the required subject.
     *
     * @returns An instance of `AccessTokenValidator` that holds the
     *          result of the access token validation. See the source
     *          code of [AccessTokenValidator](
     *          https://github.com/authlete/authlete-deno/tree/master/src/web/access_token_validator.ts)
     *          for more details about `AccessTokenValidator`.
     */
    protected async validateAccessToken(
        requiredScopes?: string[], requestedSubject?: string): Promise<AccessTokenValidator>
    {
        // Extract an access token from the request.
        const accessToken = this.extractAccessToken();

        // Create an access token validator.
        const validator = new AccessTokenValidator(this.api);

        // Validate the access token.
        await validator.validate(accessToken, requiredScopes, requestedSubject);

        // Return the validator.
        return validator;
    }
}
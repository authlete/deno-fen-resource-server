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


import { Server } from 'https://deno.land/x/fen@v0.8.0/server.ts';
import { Router } from 'https://deno.land/x/fen@v0.8.0/tool/router.ts';
import { AuthleteApiFactory } from 'https://deno.land/x/authlete_deno@v1.2.0/mod.ts';
import { TimeEndpoint } from './endpoint/time_endpoint.ts';
import { UserInfoEndpoint } from './endpoint/user_info_endpoint.ts';


// Server instance.
const server = new Server();

// Router.
const router = new Router();
const api = await AuthleteApiFactory.getDefault();
router.get('/api/userinfo',  async (context) => { await new UserInfoEndpoint(api, context).get(); });
router.post('/api/userinfo', async (context) => { await new UserInfoEndpoint(api, context).post(); });
router.get('/api/time',      async (context) => { await new TimeEndpoint(api, context).get(); });
router.post('/api/time',     async (context) => { await new TimeEndpoint(api, context).post(); });
router.get('/favicon.ico',   async (context) => { /** No favicon is provided by this implementation. */ });

// Controller.
server.setController(router.controller);

// Logger.
server.logger.changeLevel('INFO');

// Port.
server.port = 1903;

// Start the server.
server.start();
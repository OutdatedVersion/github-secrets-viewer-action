/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 672:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.run = void 0;
const node_assert_1 = __importDefault(__nccwpck_require__(61));
const promises_1 = __importDefault(__nccwpck_require__(977));
const node_os_1 = __importDefault(__nccwpck_require__(612));
const node_path_1 = __importDefault(__nccwpck_require__(411));
const node_child_process_1 = __importDefault(__nccwpck_require__(718));
const run = async (env = process.env) => {
    (0, node_assert_1.default)(!!env.INPUT_SECRETS, 'env.INPUT_SECRETS must be set');
    (0, node_assert_1.default)(!!env['INPUT_GPG-PUBLIC-KEY'], 'env.INPUT_GPG-PUBLIC-KEY must be set');
    console.log('::group::GPG version');
    console.log(node_child_process_1.default.execSync('gpg --version').toString().trim());
    console.log('::endgroup::');
    const importOutput = node_child_process_1.default
        .spawnSync('gpg', ['-vv', '--import', '-'], {
        input: env['INPUT_GPG-PUBLIC-KEY'],
    })
        .stderr.toString();
    const publicKeyId = importOutput
        .split('\n')
        .find((line) => line.trim().startsWith('keyid:'))
        ?.trim()
        .substring('keyid: '.length);
    (0, node_assert_1.default)(!!publicKeyId, 'could not figure out public key ID');
    console.log('[info] Imported GPG public key');
    const tmpDir = await promises_1.default.mkdtemp(node_path_1.default.join(node_os_1.default.tmpdir(), 'secrets'));
    console.log(`[debug] Using directory ${tmpDir}`);
    const keyConfig = [
        'Key-Type: RSA and RSA',
        'Key-Length: 4096',
        'Key-Usage: encrypt',
        'Subkey-Type: 1',
        'Subkey-Length: 4096',
        'Name-Real: GitHub secrets viewer',
        'Expire-Date: 0',
        '%no-protection',
        '%transient-key',
    ].join('\n');
    await promises_1.default.writeFile(node_path_1.default.join(tmpDir, 'gpg-key-config'), keyConfig);
    console.log('::group::GPG key config');
    console.log(keyConfig);
    console.log('::endgroup::');
    const keygenOutput = node_child_process_1.default
        .spawnSync('gpg', ['-vv', '--full-gen-key', '--batch', node_path_1.default.join(tmpDir, 'gpg-key-config')])
        .stderr.toString();
    console.log('[info] Generated GPG key for local use');
    const secretKeyId = keygenOutput
        .split('\n')
        .find((line) => line.includes('GitHub secrets viewer'))
        ?.match(/"(.+) GitHub secrets viewer"/i)?.[1];
    (0, node_assert_1.default)(!!secretKeyId, 'could not figure out secret key ID');
    await promises_1.default.writeFile(node_path_1.default.join(tmpDir, 'content'), env.INPUT_SECRETS, {
        encoding: 'utf8',
    });
    const encryptCmd = [
        'gpg',
        '--encrypt',
        // auto-trust generated key
        '--trust-model',
        'always',
        '--local-user',
        secretKeyId,
        '--recipient',
        publicKeyId,
        '--output',
        node_path_1.default.join(tmpDir, 'secrets.gpg'),
        node_path_1.default.join(tmpDir, 'content'),
    ].join(' ');
    console.log(`[debug] Encryption command '${encryptCmd}'`);
    node_child_process_1.default.execSync(encryptCmd);
    const contents = await promises_1.default.readdir(tmpDir);
    console.log('[debug] Directory contents', contents);
    (0, node_assert_1.default)(contents.includes('secrets.gpg'), 'encryption failed silently');
    console.log(`[info] Content encrypted ${node_path_1.default.join(tmpDir, 'secrets.gpg')}`);
    if (env.GITHUB_OUTPUT) {
        await promises_1.default.appendFile(env.GITHUB_OUTPUT, `path=${node_path_1.default.join(tmpDir, 'secrets.gpg')}`);
    }
    await promises_1.default.rm(node_path_1.default.join(tmpDir, 'content'));
};
exports.run = run;
(0, exports.run)();


/***/ }),

/***/ 61:
/***/ ((module) => {

module.exports = require("node:assert");

/***/ }),

/***/ 718:
/***/ ((module) => {

module.exports = require("node:child_process");

/***/ }),

/***/ 977:
/***/ ((module) => {

module.exports = require("node:fs/promises");

/***/ }),

/***/ 612:
/***/ ((module) => {

module.exports = require("node:os");

/***/ }),

/***/ 411:
/***/ ((module) => {

module.exports = require("node:path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(672);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
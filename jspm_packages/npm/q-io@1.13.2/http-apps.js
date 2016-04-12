/* */ 
require('collections/shim');
var Q = require('q');
var HTTP = require('./http');
var FS = require('./fs');
var URL = require('url2');
var inspect = require('util').inspect;
exports.Chain = require('./http-apps/chain');
var RouteApps = require('./http-apps/route');
exports.Cap = RouteApps.Cap;
exports.Tap = RouteApps.Tap;
exports.Trap = RouteApps.Trap;
exports.Branch = RouteApps.Branch;
var ContentApps = require('./http-apps/content');
exports.Content = ContentApps.Content;
exports.content = ContentApps.content;
exports.ok = ContentApps.ok;
exports.ContentRequest = ContentApps.ContentRequest;
exports.Inspect = ContentApps.Inspect;
exports.ParseQuery = ContentApps.ParseQuery;
var FsApps = require('./http-apps/fs');
exports.File = FsApps.File;
exports.FileTree = FsApps.FileTree;
exports.file = FsApps.file;
exports.directory = FsApps.directory;
exports.etag = FsApps.etag;
exports.ListDirectories = FsApps.ListDirectories;
exports.listDirectory = FsApps.listDirectory;
exports.listDirectoryHtmlFragment = FsApps.listDirectoryHtmlFragment;
exports.listDirectoryText = FsApps.listDirectoryText;
exports.listDirectoryMarkdown = FsApps.listDirectoryMarkdown;
exports.listDirectoryJson = FsApps.listDirectoryJson;
exports.listDirectoryData = FsApps.listDirectoryData;
exports.DirectoryIndex = FsApps.DirectoryIndex;
var HtmlApps = require('./http-apps/html');
exports.HandleHtmlFragmentResponses = HtmlApps.HandleHtmlFragmentResponses;
exports.handleHtmlFragmentResponse = HtmlApps.handleHtmlFragmentResponse;
exports.escapeHtml = HtmlApps.escapeHtml;
var JsonApps = require('./http-apps/json');
exports.HandleJsonResponses = JsonApps.HandleJsonResponses;
exports.handleJsonResponse = JsonApps.handleJsonResponse;
exports.Json = JsonApps.Json;
exports.json = JsonApps.json;
exports.JsonRequest = JsonApps.JsonRequest;
var RedirectApps = require('./http-apps/redirect');
exports.PermanentRedirect = RedirectApps.PermanentRedirect;
exports.PermanentRedirectTree = RedirectApps.PermanentRedirectTree;
exports.TemporaryRedirect = RedirectApps.TemporaryRedirect;
exports.TemporaryRedirectTree = RedirectApps.TemporaryRedirectTree;
exports.Redirect = RedirectApps.Redirect;
exports.RedirectTree = RedirectApps.RedirectTree;
exports.permanentRedirect = RedirectApps.permanentRedirect;
exports.permanentRedirectTree = RedirectApps.permanentRedirectTree;
exports.temporaryRedirect = RedirectApps.temporaryRedirect;
exports.temporaryRedirectTree = RedirectApps.temporaryRedirectTree;
exports.redirectTree = RedirectApps.redirectTree;
exports.redirect = RedirectApps.redirect;
exports.redirectText = RedirectApps.redirectText;
exports.redirectHtml = RedirectApps.redirectHtml;
exports.RedirectTrap = RedirectApps.RedirectTrap;
exports.isRedirect = RedirectApps.isRedirect;
var ProxyApps = require('./http-apps/proxy');
exports.Proxy = ProxyApps.Proxy;
exports.ProxyTree = ProxyApps.ProxyTree;
var NegotiationApps = require('./http-apps/negotiate');
exports.negotiate = NegotiationApps.negotiate;
exports.Method = NegotiationApps.Method;
exports.ContentType = NegotiationApps.ContentType;
exports.Language = NegotiationApps.Language;
exports.Charset = NegotiationApps.Charset;
exports.Encoding = NegotiationApps.Encoding;
exports.Host = NegotiationApps.Host;
exports.Select = NegotiationApps.Select;
var StatusApps = require('./http-apps/status');
exports.statusCodes = StatusApps.statusCodes;
exports.statusMessages = StatusApps.statusMessages;
exports.statusWithNoEntityBody = StatusApps.statusWithNoEntityBody;
exports.appForStatus = StatusApps.appForStatus;
exports.responseForStatus = StatusApps.responseForStatus;
exports.textResponseForStatus = StatusApps.textResponseForStatus;
exports.htmlResponseForStatus = StatusApps.htmlResponseForStatus;
exports.badRequest = StatusApps.badRequest;
exports.notFound = StatusApps.notFound;
exports.methodNotAllowed = StatusApps.methodNotAllowed;
exports.noLanguage = StatusApps.noLanguage;
exports.notAcceptable = StatusApps.notAcceptable;
var DecoratorApps = require('./http-apps/decorators');
exports.Normalize = DecoratorApps.Normalize;
exports.Date = DecoratorApps.Date;
exports.Error = DecoratorApps.Error;
exports.Debug = DecoratorApps.Debug;
exports.Log = DecoratorApps.Log;
exports.Time = DecoratorApps.Time;
exports.Headers = DecoratorApps.Headers;
exports.Permanent = DecoratorApps.Permanent;
exports.Decorators = DecoratorApps.Decorators;
var CookieApps = require('./http-apps/cookie');
exports.CookieJar = CookieApps.CookieJar;
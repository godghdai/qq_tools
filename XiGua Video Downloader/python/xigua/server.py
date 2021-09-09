import asyncio
from aiohttp import web
from aiohttp.web_request import Request

# import aiofiles
routes = web.RouteTableDef()


@routes.get('/')
async def index(request):
    await asyncio.sleep(0.5)
    return web.Response(body=b'<h1>Index</h1>', content_type='text/html')


@routes.get('/hello/{name}')
async def hello(request: Request):

    await asyncio.sleep(4)
    print(request.headers)
    text = request.match_info['name']
    return web.Response(body=text.encode('utf-8'), content_type='text/html')


@routes.get('/timeout/{second}')
async def timeout(request):
    # await asyncio.sleep(int(request.match_info['second']))
    data = {
        "hello": "yzd",
        "sd": "a"
    }
    return web.json_response(data)


def main():
    loop = asyncio.get_event_loop()
    app = web.Application(loop=loop)
    app.router.add_routes(routes)
    web.run_app(app, host="127.0.0.1", port=8080)
    print('Server started at http://127.0.0.1:8000...')


if __name__ == '__main__':
    main()

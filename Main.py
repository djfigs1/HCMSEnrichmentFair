from wsgiref.simple_server import make_server
from pyramid.config import Configurator
from pyramid.authentication import AuthTktAuthenticationPolicy
from pyramid.authorization import ACLAuthorizationPolicy
import logging

if __name__ == '__main__':
    config = Configurator()
    config.set_authentication_policy(AuthTktAuthenticationPolicy("hcmsfair2017", hashalg='sha512'))
    config.set_authorization_policy(ACLAuthorizationPolicy())
    config.add_route('home', '/')
    config.add_route('login', '/login')
    config.add_route('logout', '/logout')
    config.add_route('json', '/json/{json_file}')
    config.add_route('user', '/user/{id}')
    config.add_route('code', '/code')
    config.add_route('raffle', '/raffle')
    config.add_route('leaderboard', '/leaderboard')
    config.add_route('projected', '/projected')
    config.add_route('presentation_action', '/presentation_action/{presentation}/{action}')
    config.add_route('raffle_action', '/raffle_action/{action}/{user}')
    config.add_route('create_presentation', '/create_presentation')
    config.add_route('present_code', '/present/{code}')
    config.add_route('admin', '/admin')
    config.include('pyramid_chameleon')
    config.scan('views')
    config.add_static_view(name='static', path='static')

    FORMAT = '[%(asctime)s] %(levelname)s: %(message)s'
    app = config.make_wsgi_app()
    server = make_server('0.0.0.0', 8080, app)
    server.serve_forever()
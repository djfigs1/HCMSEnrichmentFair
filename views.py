from pyramid.httpexceptions import *
from pyramid.security import (remember)
from pyramid.view import view_config, view_defaults
from pyramid.response import Response
from datetime import timedelta
import logging, os, json, PointUtility, uuid

cookieName = "_hcmsID"
accepted_logins = {'admin': 'hcmsfair2017'}
globalReturnDict = {'static_url': 'https://hcms.figsware.net'}

jsonPresentationPath =  os.path.join(os.path.dirname(__file__), "data/presentations.json")
jsonRafflePath =  os.path.join(os.path.dirname(__file__), "data/raffle_users.json")

def getPresentationJSON():
    j = None
    with open(jsonPresentationPath, 'r') as file:
        j = json.load(file)
        file.close()
    return j

def writePresentationJSON(jsonToWrite):
    with open(jsonPresentationPath, 'w') as file:
        json.dump(jsonToWrite, file)

def getRaffleJSON():
    j = None
    with open(jsonRafflePath, 'r') as file:
        j = json.load(file)
        file.close()
    return j

def writeRaffleJSON(jsonToWrite):
    with open(jsonRafflePath, 'w') as file:
        json.dump(jsonToWrite, file)


def getReturnDict(dict):
    dict.update(globalReturnDict)
    return dict



@view_defaults(route_name='home')
class HCMSFairViews(object):
    def __init__(self, request):
        self.request = request
        self.logged_in = request.authenticated_userid
        self.isAdmin = request.authenticated_userid != None
        self.logger = logging.getLogger("Website Backend")

    @view_config(route_name='home', renderer='views/main.pt')
    def home(self):
        returnDict = {}
        returnDict.update(globalReturnDict)
        return returnDict

    @view_config(route_name='json', renderer='json')
    def json(self):
        try:
            file = self.request.matchdict['json_file']
        except:
            return HTTPBadRequest()

        if file == 'presentation':
            return getPresentationJSON()
        elif file == 'raffle':
            return getRaffleJSON()
        else:
            return HTTPNotFound()

    @view_config(route_name='projected', renderer='views/projected.pt')
    def projected(self):
        return getReturnDict({})

    @view_config(route_name='present_code', renderer='views/present_code.pt')
    def present(self):
        j = getPresentationJSON()

        try:
            presentation = j['presentations'][self.request.matchdict['code'].upper()]

            name = presentation['name']
            location = presentation['location']
            name_of_presenter = presentation['presenter_name']
            if (name_of_presenter == "N/A"):
                name_of_presenter = ""
            else:
                name_of_presenter += " - "
            code = self.request.matchdict['code'].upper()
            return getReturnDict({'name': name, 'location': location, 'name_of_presenter': name_of_presenter, 'code': code})
        except KeyError:
            return HTTPNotFound()

    @view_config(route_name='create_presentation', renderer='views/create_presentation.pt')
    def create_presentation(self):
        if self.isAdmin:
            return getReturnDict({'success': ''})
        else:
            return HTTPForbidden()

    @view_config(route_name='create_presentation', request_method='POST', renderer='views/create_presentation.pt')
    def create_presentation_post(self):
        try:
            presentation_name = self.request.POST['presentation_name']
            name = self.request.POST['name']
            location = self.request.POST['location']
        except KeyError:
            return HTTPBadRequest()

        j = getPresentationJSON()
        code = PointUtility.generate5DigitCode()
        while code in j['presentations']:
            code = PointUtility.generate5DigitCode()

        # Intialize the Dictionary
        j['presentations'][code] = {}
        j['presentations'][code]['presenter_name'] = name
        j['presentations'][code]['name'] = presentation_name
        j['presentations'][code]['location'] = location
        j['presentations'][code]['point_value'] = 1

        writePresentationJSON(j)
        return getReturnDict({'success': 'Generated new Presentation with Code: {0}'.format(code)})

    @view_config(route_name='raffle', renderer='views/raffle.pt')
    def raffle(self):
        return getReturnDict({})

    @view_config(route_name='raffle_action')
    def raffle_action(self):
        if (self.isAdmin):
            rj = getRaffleJSON()
            try:
                user = self.request.matchdict['user']
                action = self.request.matchdict['action']
                raffle_user = rj['users'][user]

                if (action == "ban"):
                    rj['banned_users'].append(user)
                    writeRaffleJSON(rj)
                    return HTTPFound('/admin')
                elif (action == "unban"):
                    try:
                        rj['banned_users'].remove(user)
                    except ValueError:
                        pass
                    writeRaffleJSON(rj)
                    return HTTPFound('/admin')
                elif (action == "remove"):
                    try:
                        rj['banned_users'].remove(user)
                    except ValueError:
                        pass
                    rj['users'].pop(user, None)
                    writeRaffleJSON(rj)
                    return HTTPFound('/admin')
                else:
                    return HTTPBadRequest()

            except KeyError:
                return HTTPNotFound()


    @view_config(route_name='presentation_action')
    def presentation_action(self):
        if (self.isAdmin):
            j = getPresentationJSON()
            try:
                presentation_key = self.request.matchdict['presentation']
                action = self.request.matchdict['action']
                presentation = j['presentations'][presentation_key]

                if (action == "remove"):
                    j['presentations'].pop(presentation_key, None)
                    writePresentationJSON(j)
                    return HTTPFound('/admin')
                else:
                    return HTTPBadRequest()
            except KeyError:
                return HTTPNotFound()





    @view_config(route_name='code', renderer='views/enter_code.pt')
    def code(self):
        rj = getRaffleJSON()
        cookies = self.request.cookies
        try:
            user_uuid = cookies[cookieName]
            name = rj['users'][user_uuid]['name']
        except KeyError:
            name = ""

        return getReturnDict({'name': name, 'errorMsg': '', 'successMsg': ''})

    @view_config(route_name='code', request_method='POST', renderer='views/enter_code.pt')
    def code_post(self):
        name = self.request.POST['name']
        code = self.request.POST['code'].upper()


        r = self.request.response
        cookies = self.request.cookies
        rj = getRaffleJSON()

        try:
            user_uuid = cookies[cookieName]
            user = rj['users'][user_uuid]
        except KeyError:
            user_uuid = str(uuid.uuid4())
            r.set_cookie(cookieName, user_uuid, expires=timedelta(days=365))
            rj['users'][user_uuid] = {}
            rj['users'][user_uuid]['name'] = name
            rj['users'][user_uuid]['points'] = 0
            rj['users'][user_uuid]['redeemed_codes'] = []
            user = rj['users'][user_uuid]

        # Handle Error-Cases

        if user_uuid in rj['banned_users']:
            return getReturnDict({'name': name, 'errorMsg': 'You have been banned from the raffle.', 'successMsg': ''})
        elif name == "" or code == "":
            return getReturnDict({'name': name, 'errorMsg': 'Either a name or a 5-digit code is missing from your submission.', 'successMsg': ''})
        elif len(code) < 5:
            return getReturnDict({'name': name, 'errorMsg': 'The code you entered isn\'t 5 digits.', 'successMsg': ''})
        elif len(code) > 5:
            return getReturnDict({'name': name, 'errorMsg': 'The code you entered is more than 5 digits, this really isn\'t possible unless you\'ve edited HTML.', 'successMsg': ''})

        pj = getPresentationJSON()
        points = 0
        if code in pj['presentations']:
            if code in user['redeemed_codes']:
                return getReturnDict({'name': name, 'errorMsg': 'You already redeemed that code.', 'successMsg': ''})
            points = pj['presentations'][code]['point_value']
            user['redeemed_codes'].append(code)
            user['points'] += points

            try:
                pj['presentations'][code]['times_redeemed'] += 1
            except KeyError:
                pj['presentations'][code]['times_redeemed'] = 1

        else:
            return getReturnDict({'name': name, 'errorMsg': 'The code you entered isn\'t valid.', 'successMsg': ''})

        writeRaffleJSON(rj)
        writePresentationJSON(pj)

        return getReturnDict({'name': name, 'errorMsg': '', 'successMsg': 'You\'ve just added {0} point(s) to your tally!'.format(points)})

    @view_config(route_name='leaderboard', renderer='views/leaderboard.pt')
    def leaderboard(self):
        return getReturnDict({})

    @view_config(route_name='admin', renderer='views/dashboard.pt')
    def admin(self):
        if self.logged_in != None:
            return getReturnDict({})
        else:
            return HTTPForbidden()

    @view_config(route_name='login', renderer='views/login.pt')
    def login(self):
        return getReturnDict({'error': ''})

    @view_config(route_name='login', request_method='POST')
    def login_form(self):
        try:
            username = self.request.POST['username']
            password = self.request.POST['password']
        except KeyError:
            return HTTPBadRequest()

        try:
            dictPassword = accepted_logins[username]
            if dictPassword == password:
                self.logger.info("Accepted login from {0}".format(username))
                headers = remember(self.request, username)
                return HTTPFound('/admin', headers=headers)
            else:
                self.logger.warn("Denied login {0} with password {1}".format(username, password))
                return HTTPForbidden()
        except KeyError:
            self.logger.warn("Denied login {0} with password {1}".format(username, password))
            return HTTPForbidden()
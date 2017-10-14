import random

class RaffleUser:
    def __init__(self, name, uuid):
        self.name = name
        self.uuid = uuid
        self.points = 0

    def getPoints(self):
        #TODO Get user points
        pass

RaffleUsers = []

def addNewUser(name, uuid):
    User = RaffleUser(name, uuid)
    RaffleUsers.append(User)

def removeUser(name):
    for user in RaffleUsers:
        if user.name == name:
            RaffleUsers.remove(user)

def drawRaffleUser():
    UUIDUsers = {}
    RaffleEntries = []
    for user in RaffleUsers:
        UUIDUsers[user.uuid] = user
        for point in range(0, user.points):
            RaffleEntries.append(user.uuid)

    WinnerNumber = random.randint(0, len(RaffleEntries)-1)
    Winner = UUIDUsers[RaffleEntries[WinnerNumber]]
    print(RaffleEntries, WinnerNumber)
    return Winner
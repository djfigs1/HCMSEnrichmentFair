import random


code_charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789"
path_presentations = "data/presentations.json"


def generate5DigitCode():
    code = ""
    for x in range(0,5):
        char = list(code_charset)[random.randint(0, len(code_charset) - 1)]
        code += char
    return code

class Presentation:
    def __init__(self, json={}, name="", points=None, location=""):
        self.json = json
        self.name = name
        self.points = points
        self.location = location

    def getName(self):
        return self.name

    def setName(self):
        self.name = self

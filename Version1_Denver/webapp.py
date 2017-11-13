#!/usr/bin/python3
"""
Standalone web app for the ChicagoExample SimDependency application.

TODO: genericize this for any SimDependency app.

Requires:
cherrypy3
fiona
bcrypt
requests
shapely

revision: $Id$
"""

__author__ = "thompsonm@anl.gov (Mike Thompson)"

import os
import re
import sys
import json
#import fiona
import pickle
#import bcrypt
import requests
import cherrypy
import subprocess
from passlib.hash import pbkdf2_sha256
#from shapely.geometry import asShape, Point, shape

USERS = {'analysis', 'mike'}
PATH = os.path.abspath(os.path.dirname(__file__))

cherrypy.config.update({'environment': 'embedded',
  'show_tracebacks': True, 'log.screen': True})

def validate_password(realm, username, password):
    """Check user password

    Args:
      Realm - string to be displayed to user
      Username - string - username as displayed in USERS
      Password - password

    Returns:
      boolean true if password correct, false otherwise.
    """
    if username in USERS:
       with open('%s.passwd' % username.lower(), "rb") as f:
         storage = pickle.load(f)
         uname = storage[0]
         hashed = storage[1]
         if pbkdf2_sha256.verify(password, hashed):
           print("good")
           return True
         else:
           print("%s: %s bad!" % (uname, hashed))
           return False

class Root(object):
  """Cherrypy class describing our web root."""

  def __init__(self):
    """Default init method"""
    self.saved = {}

  @cherrypy.expose
  def index(self):
    """Hello world, for index"""
    cherrypy.response.headers["Access-Control-Allow-Origin"] = "*"
    return 'Hello World!'

  @cherrypy.expose
  def isInShape(shp, lat, lon):
    """Determine if a point is in a shape

    Args:
      shp - shapefile location (on disk)
      lat - latitude (will cast to float)
      lon - longitude (will cast to float)

    Returns:
      True or False
    """
    with fiona.open(shp) as fc:
      point = Point(float(lon), float(lat)) # longitude, latitude
      for feature in fc:
        if shape(feature['geometry']).contains(point):
          return True

#def capitalizeWords(s):
#  return re.sub(r'\w+', lambda m:m.group(0).capitalize(), s)

static_config={
  '/': {
    'tools.staticdir.on': True,
    'tools.staticdir.dir': PATH,
    'tools.staticdir.index': 'index.html',
    'log.screen': True,
#       'tools.auth_basic.on': True,
#       'tools.auth_basic.realm':
#         'Please use Chrome or Firefox to access this site.',
#       'tools.auth_basic.checkpassword': validate_password
  },
}

cherrypy.config.update({'server.socket_host': '0.0.0.0',
                         'server.socket_port': int(sys.argv[1]),
                        })
cherrypy.quickstart(Root(), config=static_config)

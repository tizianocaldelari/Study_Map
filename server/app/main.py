from fastapi import FastAPI 
from fastapi.responses import HTMLResponse
from fastapi.responses import ORJSONResponse
# CORS aktivieren für FastAPI Backend
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI() 

# CORS Einstellungen
# siehe: https://fastapi.tiangolo.com/tutorial/cors/#use-corsmiddleware
origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple Hello World example
@app.get("/") 
async def root(): 
	return {"message": "Hello GDI Project"}
	
    
# Erstellt eine About Seite mit HTML Output 
# import HTMLResponse benötigt
@app.get("/about/")
def about():
    return HTMLResponse(
    """
    <html>
      <head>
        <title>FAST API Service</title>
      </head>
      <body>
        <div align="center">
          <h1>Simple FastAPI Server About Page</h1>
          <p>Dieser FastAPI Rest Server bietet eine einfache REST Schnittstelle. Die Dokumentation ist über <a href="http://localhost:8000/docs">http://localhost:8000/docs</a> verfügbar.</p> 
        </div>
      </body>
    </html>
    """
    )

# Simple static JSON Response 
# (requires package "orjson" https://github.com/ijl/orjson https://anaconda.org/conda-forge/orjson conda install -c conda-forge orjson)
# source: https://fastapi.tiangolo.com/advanced/custom-response/
@app.get("/points/", response_class=ORJSONResponse)
async def read_points():
    return ORJSONResponse({
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "FHNW"
      },
      "geometry": {
        "coordinates": [
          7.642053725874888,
          47.53482543914882
        ],
        "type": "Point"
      },
      "id": 0
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Bern"
      },
      "geometry": {
        "coordinates": [
          7.4469686824532175,
          46.95873550880529
        ],
        "type": "Point"
      },
      "id": 1
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Zurich"
      },
      "geometry": {
        "coordinates": [
          8.54175132796243,
          47.37668053625666
        ],
        "type": "Point"
      },
      "id": 2
    }
  ]
})

   
# Post Query - test on the OPENAPI Docs Page
@app.post("/square")
def square(some_number: int) -> dict:
    square = some_number * some_number
    return {f"{some_number} squared is: ": square}
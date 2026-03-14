from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel
import shutil, os, tempfile
from app.services import climate_service as cs

router = APIRouter()

class CompareBody(BaseModel):
    year1: int
    year2: int
    variable: str
    region: str = "Global"

@router.get("/summary")
def summary():
    return cs.get_summary()

@router.get("/trends")
def trends(variable: str = "temperature", region: str = "Global"):
    return {"data": cs.get_trends(variable, region)}

@router.post("/compare")
def compare(body: CompareBody):
    try:
        return cs.compare_years(body.year1, body.year2, body.variable, body.region)
    except Exception as e:
        raise HTTPException(400, detail=str(e))

@router.get("/compare")
def compare_get(year1: int = Query(2000), year2: int = Query(2024),
                variable: str = Query("temperature"), region: str = Query("Global")):
    """GET version of compare for easier frontend calls"""
    try:
        return cs.compare_years(year1, year2, variable, region)
    except Exception as e:
        raise HTTPException(400, detail=str(e))

@router.get("/globe")
def globe(year: int = 2024, variable: str = "temperature"):
    # Return the data directly (not double-nested)
    return cs.get_globe_points(year, variable)

@router.get("/insights")
def insights(
    year1: int = Query(2000), year2: int = Query(2024),
    region: str = Query("Global"), variable: str = Query("temperature")
):
    return cs.get_insights(year1, year2, region, variable)

@router.get("/heatmap")
def heatmap():
    return cs.get_heatmap()

@router.get("/export")
def export(year: int = 2024, variable: str = "temperature"):
    """Download current data slice as a .nc file."""
    try:
        path = cs.export_to_netcdf(year, variable)
        return FileResponse(
            path, 
            media_type='application/x-netcdf',
            filename=f"clima_export_{year}_{variable}.nc"
        )
    except Exception as e:
        raise HTTPException(500, detail=str(e))

@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".csv", ".nc"]:
        raise HTTPException(400, "Only CSV and NetCDF (.nc) files are supported.")
    
    suffix = ext
    fd, path = tempfile.mkstemp(suffix=suffix)
    try:
        with os.fdopen(fd, 'wb') as tmp:
            shutil.copyfileobj(file.file, tmp)
        
        if ext == ".nc":
            result = cs.process_netcdf(path)
        else:
            result = cs.save_uploaded(path)
            
        return {"message": "Dataset processed and integrated successfully.", **result}
    except ValueError as e:
        raise HTTPException(422, detail=str(e))
    except Exception as e:
        raise HTTPException(500, detail=f"Processing failed: {str(e)}")
    finally:
        if os.path.exists(path):
            os.unlink(path)

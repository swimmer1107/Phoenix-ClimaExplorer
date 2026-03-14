import pandas as pd
import numpy as np
import os

def generate():
    np.random.seed(42)
    regions = {
        "North America": ((25,70), (-168,-50)),
        "South America": ((-55,12), (-81,-34)),
        "Europe":        ((35,71), (-10,40)),
        "Africa":        ((-35,37), (-20,51)),
        "Asia":          ((5,75),  (40,180)),
        "Australia":     ((-45,-10),(110,155)),
        "Arctic":        ((66,82), (-180,180)),
    }
    rows = []
    for year in range(2000, 2025):
        for region, (lat_r, lon_r) in regions.items():
            for _ in range(20):
                lat = np.random.uniform(*lat_r)
                lon = np.random.uniform(*lon_r)
                yf  = (year - 2000) / 24.0          # 0‑1 progress factor

                temp     = 14 + yf*2.5 + np.random.normal(0, 4)
                if lat > 60:  temp -= 18
                if lat < 15:  temp += 10

                rainfall = max(0, 900 + yf*60 + np.random.normal(0, 400))
                humidity = float(np.clip(60 + np.random.normal(0, 15), 10, 100))
                wind     = max(0, 14 + np.random.normal(0, 4))
                co2      = 370 + yf * 55 + np.random.normal(0, 2)

                risk = (
                    (temp / 35) * 3 +
                    (co2  / 450) * 4 +
                    abs(rainfall - 900) / 2000
                ) * 1.2 + np.random.normal(0, 0.5)

                rows.append(dict(
                    year=year, region=region,
                    latitude=round(lat, 4), longitude=round(lon, 4),
                    temperature=round(temp, 2),
                    rainfall=round(rainfall, 2),
                    humidity=round(humidity, 2),
                    wind_speed=round(wind, 2),
                    co2_index=round(co2, 2),
                    climate_risk_score=round(risk, 3)
                ))

    df = pd.DataFrame(rows)
    out = os.path.join(os.path.dirname(__file__), "sample_climate_data.csv")
    df.to_csv(out, index=False)
    print(f"Generated {len(df)} rows → {out}")

if __name__ == "__main__":
    generate()

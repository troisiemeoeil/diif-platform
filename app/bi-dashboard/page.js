'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const PowerBIEmbed = dynamic(
    () => import('powerbi-client-react').then(mod => mod.PowerBIEmbed),
    { ssr: false }
);

export default function Page() {
    const [models, setModels] = useState(null);

    useEffect(() => {
        import('powerbi-client').then((mod) => {
            setModels(mod.models);
        });
    }, []);

    if (!models) return null;

    return (
        <div className='w-screen bg-amber-300 h-screen'>

            <PowerBIEmbed
                embedConfig={{
                    type: 'report',
                    id: "5cef4d96-2d87-4c39-a709-2b64841ca086",
                    embedUrl: "https://app.powerbi.com/reportEmbed?reportId=5cef4d96-2d87-4c39-a709-2b64841ca086&groupId=2d826f27-98f2-4c27-b9f1-6854512d3cee&w=2&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLU5PUlRILUVVUk9QRS1yZWRpcmVjdC5hbmFseXNpcy53aW5kb3dzLm5ldCIsImVtYmVkRmVhdHVyZXMiOnsidXNhZ2VNZXRyaWNzVk5leHQiOnRydWV9fQ%3d%3d",
                    accessToken: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6InNNMV95QXhWOEdWNHlOLUI2ajJ4em1pazVBbyIsImtpZCI6InNNMV95QXhWOEdWNHlOLUI2ajJ4em1pazVBbyJ9.eyJhdWQiOiJodHRwczovL2FuYWx5c2lzLndpbmRvd3MubmV0L3Bvd2VyYmkvYXBpIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvYWNjYWU2MTUtOGQxNy00Y2E1LWJmYzUtYzhkNzk5YzJkYzJlLyIsImlhdCI6MTc3MjE4MzM2NiwibmJmIjoxNzcyMTgzMzY2LCJleHAiOjE3NzIxODc2OTEsImFjY3QiOjAsImFjciI6IjEiLCJhZ2VHcm91cCI6IjMiLCJhaW8iOiJBWFFBaS84YkFBQUFtZFVWTDBZKzczcjBrd2ZsVUUxNmxkWHBkaFlHQjZkcE90YzJ2d2ZWY1BiZm9ITjVXNk41YW1ud3JQMmtRZklhZTc4ZmNYT3BqcmJvekI3WjVwTEZ0dDYxVVBZd1oxQUFWZWowLytiMnpsWUNqK0FHVDRXOU1NOEJXTjc3QTV3ck9qOXEyMUI5dDdhb0ZlQkRVSXlyVmc9PSIsImFtciI6WyJwd2QiLCJtZmEiXSwiYXBwaWQiOiI4NzFjMDEwZi01ZTYxLTRmYjEtODNhYy05ODYxMGE3ZTkxMTAiLCJhcHBpZGFjciI6IjAiLCJmYW1pbHlfbmFtZSI6IkJvdWxha2hyYXMiLCJnaXZlbl9uYW1lIjoiQWhtZWQiLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiIxOTUuMTQ4LjE4MC4yMzMiLCJuYW1lIjoiQWhtZWQgQm91bGFraHJhcyIsIm9pZCI6IjlmNjFiODdiLTMzYmUtNGFhNy05NWI4LWRmYzAzMDg0NWIwOCIsInB1aWQiOiIxMDAzMjAwNDM3QkZFN0VGIiwicmgiOiIxLkFSOEFGZWJLckJlTnBVeV94Y2pYbWNMY0xna0FBQUFBQUFBQXdBQUFBQUFBQUFDRkFHd2ZBQS4iLCJzY3AiOiJ1c2VyX2ltcGVyc29uYXRpb24iLCJzaWQiOiIwMDIyYWIxYS1hNjNlLTZlZTYtMGRjZC0xYmI4NzgxOTE5MTgiLCJzaWduaW5fc3RhdGUiOlsiaW5rbm93bm50d2siXSwic3ViIjoiNFJsOEV6bkViY04yaEFDdDhrb3NXVVk2R3c3azhiR1Q5QVBRNXJfMVd2ZyIsInRpZCI6ImFjY2FlNjE1LThkMTctNGNhNS1iZmM1LWM4ZDc5OWMyZGMyZSIsInVuaXF1ZV9uYW1lIjoiYWhtZWQuYm91bGFraHJhczJAY2VudHJpYS5maSIsInVwbiI6ImFobWVkLmJvdWxha2hyYXMyQGNlbnRyaWEuZmkiLCJ1dGkiOiJDVW1XRE9pTGtVT2QyYmktSjVJU0FBIiwidmVyIjoiMS4wIiwid2lkcyI6WyJiNzlmYmY0ZC0zZWY5LTQ2ODktODE0My03NmIxOTRlODU1MDkiXSwieG1zX2FjdF9mY3QiOiIzIDUiLCJ4bXNfZnRkIjoibWIxbHUwUFczbUdybmpCazdsTm04c1RPYXRfLTFfRFFSLXh5cU9sLUVzd0JjM2RsWkdWdVl5MWtjMjF6IiwieG1zX2lkcmVsIjoiMSAxNCIsInhtc19zdWJfZmN0IjoiMyA0In0.MvEN3_m3hz553gupVynwS0ghpb76uqnawfZd2B9ZtiAfVMgeyU2iRLdMcvf2Jd0uX2uciWEGTV8c1LWlCZ9gTaExYwxboDFk8NTx4nT_ojx9z_Asw877TraC4OwxGNB41jycjWmKrI31ACFxtMFzcrkvyoodEFrh0XV7xMtQcpdrJG6u3wwCZhOIeNLG1rnhmnGNnAIpXfmvlVZLOuucfVzvl_-RRniMv59Oi7dV6ZHAfqxrbMQJPPiwO9GJWQZwFXNjf4uVFJu3WyxGP31H7Snc8GqxExSle3DRM4EbMr7NxOV8IliuVGDVySxlQvtul3Urq1Kha7TqJNbrb2vcow",
                    datasetId: "bbf19826-3aad-462f-83f7-c729dc9d40fc",
                    tokenType: 1,
                    settings: {
                        background: models.BackgroundType.Transparent,
                    }
                }}
            
            />
        </div>
    )
}

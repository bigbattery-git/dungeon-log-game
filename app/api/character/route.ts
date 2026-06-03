import { ERROR401, ERRORJSON, ERRORSERVER } from "@/lib/config";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { POSTCharacterRequest, POSTCharacterRequestSchema } from "@/schema/character/character";
import { GETCharacterResponse, POSTCharacterResponse } from "@/types/character/character";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest){
    const response : GETCharacterResponse = {
        success : false,
        message : null
    } 
    
    const session = await getSession();

    if(!session || !session.isLoggedin){
        response.message = ERROR401;
        return NextResponse.json(response, {status : 401});
    }

    try{
        const result = await prisma.character.findMany({
            select : {
                id : true,
                name : true,
                hp : true,
                str : true,
                def : true,
                luk : true
            }, where : {
                userId : session.user.id
            }
        })

        response.success = true;
        response.message = "캐릭터 조회에 성공했습니다."
        response.data = result;

        return NextResponse.json(response, {status : 200});

    } catch (e) {
        console.error("GET /api/character :", e);
        response.message = ERRORSERVER;
        return NextResponse.json(response, {status : 500});
    }
}

export async function POST(req:NextRequest){
    let reqData : POSTCharacterRequest | null | undefined;
    const response : POSTCharacterResponse = {
        success : false,
        message : null
    }

    const session = await getSession();

    if(!session || !session.isLoggedin){
        response.message = ERROR401;
        return NextResponse.json(response, {status : 401});
    }

    try {
        reqData = await req.json();
    } catch {
        response.message = ERRORJSON;
        return NextResponse.json(response, {status : 400});
    }

    const zodReqData = POSTCharacterRequestSchema.safeParse(reqData);

    if(!zodReqData.success){
        response.error = zodReqData.error.flatten().fieldErrors;
        return NextResponse.json(response, {status : 422});
    }

    try{
        const characterCount = await prisma.character.count({
            where :{
                userId : session.user.id
            }
        });

        if(characterCount > 5){
            response.message = "캐릭터는 최대 5개 까지만 생성 가능합니다.";
            return NextResponse.json(response, {status : 409});
        }

        const createData : {
            name : string,
            userId : string,
            str ?: number,
            def ?: number,
            luk ?: number,
            hp ?: number
        }= {
            name : zodReqData.data.name, 
            userId : session.user.id
        }

        // TODO 해당 부분 더 나은 방법 찾아서 리팩토링 할 것. 이거 단순 null 허용 컬럼이 아니라 default값 있는 것들 이렇게 처리하면 컬럼 100개 넘어가는건 이렇게 못할 듯

        if(zodReqData.data.str){
            createData.str = zodReqData.data.str;
        }

        if(zodReqData.data.def){
            createData.def = zodReqData.data.def;
        }

        if(zodReqData.data.luk){
            createData.luk = zodReqData.data.luk
        }

        if(zodReqData.data.hp){
            createData.hp = zodReqData.data.hp
        }

        await prisma.character.create({
            data : createData
        })

        response.success = true;
        response.message = "캐릭터 생성을 완료했습니다."

        return NextResponse.json(response, {status : 200});
    } catch (e) {
        console.error("POST /api/character : ", e);
        response.message = ERRORSERVER;
        return NextResponse.json(response, {status : 500});
    }
}
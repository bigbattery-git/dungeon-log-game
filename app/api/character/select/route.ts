import { ERROR401, ERRORJSON, ERRORSERVER } from "@/lib/config";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { POSTCharacterSelectResponse } from "@/types/character/character";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req : NextRequest){
    let reqData : {id : number} | null | undefined;
    const response : POSTCharacterSelectResponse = {
        success : false,
        message : null
    }

    const session = await getSession();

    if(!session || !session.isLoggedin){
        response.message = ERROR401;
        return NextResponse.json(response, {status : 401})
    }

    try{
        reqData = await req.json();
    } catch {
        response.message = ERRORJSON;
        return NextResponse.json(response,{status : 400});    
    }

    if(!reqData?.id){
        response.message = "아이디는 꼭 필요합니다.";
        
        return NextResponse.json(response, {status : 422});
    }

    try{
        const chkCharacter = await prisma.character.findFirst({
            select : {
                id : true,
                userId : true
            }, 
            where : {
                id : reqData.id
            }
        })

        
        if(!chkCharacter){
            response.message = "캐릭터가 없습니다";
            return NextResponse.json(response, {status : 404});
        }
        

        if(chkCharacter.userId !== session.user.id){
            response.message = "본인의 캐릭터만 할 수 있습니다";
            return NextResponse.json(response, {status : 403});
        }

        const userId = session.user.id;
        session.user = {
            id : userId,
            charId : chkCharacter.id
        }

        await session.save();

        response.message = "캐릭터를 선택하셨습니다.";
        response.success = true;

        return NextResponse.json(response, {status : 200});

    } catch(e) {
        console.error("POST /api/character/select: ",e);
        response.message = ERRORSERVER;
        return NextResponse.json(response, {status : 500});
    }
}
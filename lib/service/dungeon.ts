import { BattleResponse, GetItemResponse, GetMonsterResponse, GetTrapResponse } from "@/types/dungeon/dungeon";
import { prisma } from "../prisma";
import { getRandomInt } from "../utils/rand";
import { getRedis } from "../redis";
import { changeMinToSec } from "../utils/time";

export async function getItem(id : number, currentSec : number) : Promise<GetItemResponse>{
    const count = await prisma.defaultItem.count({
        where : {
            deletedAt : null
        }
    })

    const rnd : number = getRandomInt(count) + 1;

    const item = await prisma.defaultItem.findUnique({
        select : {
            id:true,
            name:true
        },
        where : {
            id : rnd
        }
    })

    const redis = await getRedis();

    if(item?.id){
        await redis.rPush(`item:${id}`, String(item?.id));
    }

    return {
        message : `${changeMinToSec(currentSec)} : ${item?.name}을 얻었습니다.`,
        itemId : rnd
    }
}

export async function getTrap(id:number, sec : number) : Promise<GetTrapResponse>{
    const rnd : number = getRandomInt(5);

    const redis = await getRedis();

    const character = await redis.hGetAll(`character:${id}`);

    character.hp = String(Number(character.hp) - rnd);

    redis.hSet(`character:${id}`, character);

    return {
        message : changeMinToSec(sec) + " : 함정에 걸렸습니다. " + String(rnd+1) + " 피해",
        damage : rnd + 1
    }
}

export async function getMonster(id : number, currentSec : number) : Promise<GetMonsterResponse>{
        const count = await prisma.monster.count({
        where : {
            deletedAt : null
        }
    })

    const rnd : number = getRandomInt(count) + 1;

    const monster = await prisma.monster.findUnique({
        select : {
            id : true,
            name : true,
            str : true,
            hp : true
        },
        where : {
            id : rnd
        }
    })

    const redis = await getRedis();

    if(monster){
        await redis.hSet(`monster:${id}`, {
            hp : monster?.hp,
            str : monster?.str
        });
    }

    return {
        message : `${changeMinToSec(currentSec)} : ${monster?.name}을 만났습니다.`,
    }
}

export async function battle(id : number, currentSec : number) : Promise<BattleResponse>{

    const redis = await getRedis();

    const monster = await redis.hGetAll(`monster:${id}`);
    const character = await redis.hGetAll(`character:${id}`);

    const rnd = getRandomInt(6);

    const monsterCrit = rnd === 0 || rnd === 1;
    const characterCrit = rnd === 5 || rnd === 4;

    const currentMonsterHp = characterCrit ? 0 : Number(monster.hp) - Number(character.str);
    const currentCharacterHp = Number(character.hp) - (monsterCrit ? Number(monster.str) * 2 : Number(monster.str));

    const response : BattleResponse = {
        message : `${changeMinToSec(currentSec)} : rand전투 종료 - 적 체력 : ${currentMonsterHp <= 0 ? 0 : currentMonsterHp}, 내 체력 : ${currentCharacterHp <= 0 ? 0 : currentCharacterHp}`,
        charHealth : currentCharacterHp,
        monsterHealth : currentMonsterHp
    }

    monster.hp = String(currentMonsterHp);
    await redis.hSet(`monster:${id}`, monster);

    character.hp = String(currentCharacterHp);
    await redis.hSet(`character:${id}`, character);

    if(currentMonsterHp <=0 ){
        await redis.del(`monster:${id}`);

        character.exp = String(Number(character.exp) + 100);
        await redis.hSet(`character:${id}`, character);
    }

    return response;
}

export async function chkCharacterDead(id : number) : Promise<boolean>{
    const redis = await getRedis();

    const character = await redis.hGetAll(`character:${id}`);

    const characterHp = Number(character.hp)

    if(characterHp <= 0){
        return true;
    }

    return false;
}

export function exitDungeon(currentSec : number) : string{
    return `${changeMinToSec(currentSec)} : 던전에서 탈출했습니다.`
}
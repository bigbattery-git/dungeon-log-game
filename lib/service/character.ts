import { prisma } from "../prisma";

export async function getUserData(id : number) : Promise<{
    name: string;
    id: number;
    def: number;
    hp: number;
    exp: number;
} | null>
{
    try {
        const userData = await prisma.character.findUnique({
            select : {  
                id : true,
                exp : true,
                name : true,
                def : true,
                hp : true,
                str : true
            }, where : {
                id : id
            }
        })

        if(!userData){
            return null;
        }
        return userData;
    } catch(e) {
        console.error("SERVICE getUserData : ", e);
        return null;
    }
}
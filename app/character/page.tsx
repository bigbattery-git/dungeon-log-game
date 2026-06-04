import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Control from "./(components)/Control";

export default async function CharacterPage(){
    const session = await getSession();

    if(!session || !session.isLoggedin){
        redirect('/login');
    }

    return (
        <>
            <Control />
        </>
    )
}
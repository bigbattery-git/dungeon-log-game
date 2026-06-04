"use client"

import { Character, POSTCharacterError } from "@/types/character/character";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"

export default function Control(){
    const [characters, setCharacters] = useState<Character[]>();
    const [error, setError] = useState<POSTCharacterError>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [name, setName] = useState<string>("");
    const route = useRouter();

    async function getCharacters() : Promise<void>{
        try {
            const data = await axios.get('/api/character');
            
            setCharacters(data.data.data);
        }catch (e){
            if(e instanceof AxiosError){
                if(e.response?.status === 401){
                    route.push('/login');
                } else {
                    alert(e.response?.data.message);
                }
            }
        }
    }

    async function createCharacter() : Promise<void>{
        try{
            if((characters && characters?.length >= 5)){
                alert("더이상 캐릭터를 생성할 수 없습니다.");
                return;
            }

            await axios.post('/api/character', {name : name});

            await getCharacters();

            await setName("");
        }catch (e){
            if(e instanceof AxiosError){
                if(e.response?.status === 401){
                    route.push('/login');
                } else if (e.response?.status === 422) {
                    setError(e.response.data.error)
                } else {
                    alert(e.response?.data.message);
                }
            }
        }
    }

    async function deleteCharacter(id : number) : Promise<void>{
        try{
            await axios.post('/api/character/delete', {"id" : id})

            await getCharacters();
        }catch (e) {
            if(e instanceof AxiosError){
                if(e.response?.status === 401){
                    route.push('/login');
                } else {
                    alert(e.response?.data.message);
                }
            }
        }
    }

    async function selectCharacter(id : number) : Promise<void>{
        try{
            await axios.post('/api/character/select', {"id" : id});

            route.push('/dungeon');
        }catch (e) {
            if(e instanceof AxiosError){
                if(e.response?.status === 401){
                    route.push('/login');
                } else {
                    alert(e.response?.data.message);
                }
            }
        }
    }

    useEffect(()=>{
        async function init(){
            await setIsLoading(true);

            await getCharacters();

            await setIsLoading(false);
        }

        init();
    }, []);


    if(isLoading){
        return<>로딩중</>
    }

    return(
        <>
        <div className="flex justify-center gap-1">
            {characters?.map((a, i) => {
                return(
                    
                        <div className="border p-2 flex-col items-center gap-1" key={i}>
                            <p>이름 : {a.name}</p>
                            <p>체력 : {a.hp}</p>
                            <p>공격력 : {a.str}</p>
                            <p>경험치 : {a.exp}</p>
                            <div className="border p-2 flex gap-2">
                                <button 
                                className="border"
                                onClick={() => {deleteCharacter(a.id)}}
                                >삭제하기</button>
                                <button 
                                className="border"
                                onClick={() => {selectCharacter(a.id)}}
                                >캐릭터 선택</button>
                            </div>
                        </div>
                    
                )
            })}
        </div>
        <hr className="m-2" />
        <h1 className="text-3xl">캐릭터 생성하기(이름만 있으면 됨)</h1>
        <input
        value={name}
        onChange={(e) => {setName(e.target.value)}}
        placeholder="이름 입력"
        className="border p-1"
        />

        <button
        disabled={(characters && characters?.length >= 5)}
        className="border p-2"
        onClick={createCharacter}
        >{characters && characters?.length >= 5 ?  "더이상 생성할 수 없습니다" : "캐릭터 생성하기"}</button>
        </>
    )
}
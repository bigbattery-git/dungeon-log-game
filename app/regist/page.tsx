"use client"

import { POSTRegistRequest } from "@/schema/auth/regist";
import { POSTRegistResponse } from "@/types/auth/regist";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegistPage() {
    const [email, setEmail] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<POSTRegistResponse>();

    const route = useRouter();

    async function onClickRegistButton(){
        try{
            const registForm : POSTRegistRequest = {
                email : email,
                name : name,
                password : password
            }

            const req = await axios.post('/api/auth/regist', registForm);
            if(req.data.success){
                route.push('/');
            }
        } catch (e) {
            if(e instanceof AxiosError){
                if(e.response){
                    setError(e.response.data);
                    setPassword("");

                    if(e.response.status === 400){
                        alert(e.response.data.message);
                    }
                }
            }
        }
    }

    return (
        <>
            <h1 className="text-5xl">회원가입</h1>
            <input 
            className="border"
            placeholder="email 입력"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-red-400">{error ? error.error?.email : ""}</p>
            <input 
            className="border"
            placeholder="이름 입력"
            value={name}
            onChange={(e) => setName(e.target.value)}
            />
            <p className="text-red-400">{error ? error.error?.name : ""}</p>
            <input 
            className="border"
            placeholder="비밀번호 입력"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-red-400">{error ? error.error?.password : ""}</p>
            <button className="border m-3" onClick={() => onClickRegistButton()}>회원가입</button>
        </>
    )
}
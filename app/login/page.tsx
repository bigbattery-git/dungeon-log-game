"use client"

import { POSTLoginRequest } from "@/schema/auth/login";
import { POSTLoginResponse } from "@/types/auth/login";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage(){

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<POSTLoginResponse>();

    const route = useRouter();

    async function onClickLoginButton(){
        try{
            const loginForm : POSTLoginRequest = {
                email : email,
                password : password
            }

            const req = await axios.post('/api/auth/login', loginForm);
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
            <h1 className="text-5xl">로그인</h1>
            <input 
            className="border"
            placeholder="email 입력"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-red-400">{error ? error.error?.email : ""}</p>
            <input 
            className="border"
            placeholder="비밀번호 입력"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-red-400">{error ? error.error?.password : ""}</p>
            <button className="border m-3" onClick={() => onClickLoginButton()}>로그인</button>
        </>
    )
}
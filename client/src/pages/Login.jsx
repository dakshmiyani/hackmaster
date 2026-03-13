import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/common/Loader";

const Login = () => {
    const navigate = useNavigate();
    const { loginUser } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = () => {
        setShow(!show);
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        console.log("🔐 Login attempt:", { email, password });
        setIsLoading(true);

        try {
            const result = await loginUser({ email, password });

            if (result.success) {
                toast.success("Login successful!");
                const user = result.user;
                const role_id = user?.role_id;
                console.log("Role ID:", role_id);

                if (role_id === 1) {
                    navigate("/volunteer", { replace: true });
                } else if (role_id === 2) {
                    navigate("/super_admin", { replace: true });
                } else if (role_id === 3) {
                    navigate("/judge", { replace: true });
                }else if (role_id === 4) {
                    navigate("/mentor", { replace: true });
                }else if (role_id === 5) {
                    navigate("/team-leader", { replace: true });
                }
            } else {
                toast.error(result.message || "Login failed. Please check your credentials.");
            }
        } catch (error) {
            console.error("Login handle error:", error);
            toast.error("Could not connect to the server.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative w-screen min-h-dvh bg-[#050505] text-white flex flex-col p-4 overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/5 blur-[120px] rounded-full"></div>

            <div className="relative z-10 flex flex-col flex-1 gap-7 pt-12 sm:pt-20">
                {/* HEADER */}
                <div className="flex flex-col items-center gap-3">
                    <div className="h-25 w-25 bg-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-600/20">
                        <span className="font-black text-5xl tracking-tighter">HM</span>
                    </div>
                    <div className="text-center">
                        <h1 className="text-4xl font-black uppercase tracking-tighter">HackMaster</h1>
                        <p className="text-[15px] text-red-500 font-bold uppercase tracking-widest mt-1">Innovation Management</p>
                    </div>
                </div>

                <h3 className="text-center font-extralight text-4xl uppercase tracking-[0.2em] mt-4 mb-4">Welcome</h3>

                {/* FORM CONTAINER */}
                <form onSubmit={handleLogin} className="flex-1 max-w-sm mx-auto w-full flex flex-col justify-between pb-10">
                    {/* INPUTS SECTION */}
                    <div className="flex-1 flex flex-col space-y-6">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="name@example.com"
                                className="mt-2 w-full bg-[#111] border border-white/10 px-4 py-3 rounded-xl outline-none focus:border-red-600 transition-all font-mono text-sm"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                                Password
                            </label>
                            <div className="relative mt-2">
                                <input
                                    type={show ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-[#111] border border-white/10 px-4 py-3 rounded-xl outline-none focus:border-red-600 transition-all font-mono text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={handleClick}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {show ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* LOGIN BUTTON */}
                    <div className="flex flex-col gap-4 mt-10">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-red-600 p-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-red-600/20"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-3">
                                    <Loader isLoading={isLoading} inline={true} />
                                    <span>Authenticating...</span>
                                </div>
                            ) : (
                                "Login to HackMaster"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;

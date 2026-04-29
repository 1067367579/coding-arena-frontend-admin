import axios from "axios";
import { getToken, removeToken } from "@/utils/cookie";
import router from "@/router";
import { mockRequest } from "@/utils/mockService";

//不同的功能 通过axios请求的是不同接口的地址
//后端为微服务项目 网关 127.0.0.1:19090 该项目只负责管理端 注意此处要加上http协议
axios.defaults.headers["Content-Type"] = "application/json;charset=utf-8";
const service = axios.create({
    baseURL: "/dev-api",
    timeout: 5000,
    
})

if (import.meta.env.VITE_USE_MOCK === "true") {
    service.defaults.adapter = (config) => mockRequest(config);
}

//设置响应拦截器
service.interceptors.response.use(
    //只要前端后端正确发送与响应 就是成功
    (res) => { 
        //res就是响应数据
        const code = res.data.code;
        const msg = res.data.msg;
        if(code === 1000) {
            //成功 直接返回
            return Promise.resolve(res.data);
        } 
        //异常处理
        if(code === 3001) {
            //如果是令牌出现异常 就直接跳到登录界面 这样就能保证后端redis已经过期 前端也能同步处理
            //同时要去掉cookie当中的token 才能够使该操作不再重复 防止持续刷接口
            removeToken();
            router.push("/oj/login");
        }
        return Promise.reject(new Error(msg));
    },
    //失败回调 
    (error) => {
        return Promise.reject(error);
    }
)

//设置请求拦截器 发出请求之前先放令牌到请求头中
service.interceptors.request.use(
    (config) => { 
        if(getToken()) {
            config.headers["authentication"] = "Bearer "+getToken();
        }
        return config;
    },
    //失败回调
    (error) => {
        return Promise.reject(error);
    }
)

export default service;

//同源策略 浏览器处于安全考虑 只允许来自同一源的请求访问资源
//协议不同 端口不同 域名不同 都会判定不属于同一个源

//代理服务器 前端和后端的端口不可能一样 将后端的资源URL 设置为与前端同源 然后通过代理服务器 访问后端
//代理服务器相当于中间人

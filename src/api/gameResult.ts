import request from '@/utils/request';

//点击游戏结果-列表
export async function getGameResultList( data: object){
	const res= await request({
		url: '/getGameResultList',
		method: 'post',
		data:{
			...data
		}
	})
	return res;
}
//点击游戏结果-游戏列表
export async function gameList( data?: object){
	const res= await request({
		url: '/gameList',
		method: 'post',
		data:{
			...data
		}
	})
	return res;
}
//点击游戏结果-台桌列表
export async function deskList( data?: object){
	const res= await request({
		url: '/deskList',
		method: 'post',
		data:{
			...data
		}
	})
	return res;
}
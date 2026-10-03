import { defineStore } from "pinia";

export const countStore = defineStore("count", {
	state: ()=> ({
		nickName: '',
		userId: null,
		avatarEmoji: '',
		product: [],
		cartOrderShops: [],
	}),
	
	actions: {
		setNickName(name) {
			this.nickName = name;
		},
		setUserId(id) {
			this.userId = id;
		},
		setAvatarEmoji(emoji) {
			this.avatarEmoji = emoji;
		},
		pushProduct(pro) {
			this.product.push(pro)
		},
		clearProdect() {
			this.product = []
		},
		pushCartOrderShops(arr) {
			arr.forEach(obj => {
				let sub = 0;
				obj.items.forEach(el => {
					sub += el.quantity * el.price
				})
				this.cartOrderShops.push({
					...obj,
					remark: '',
					subtotal: sub
				})
			})
		},
		clearCartOrderShops() {
			this.cartOrderShops = []
		}
	}
})
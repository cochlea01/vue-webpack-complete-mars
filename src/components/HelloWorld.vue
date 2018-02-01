<template>
    <div>
        IndexPage
        <div style="width:100%;height:20rem;margin:0 auto;">
            <VueCropper
            ref="cropper"
            :img="option.img"
            :outputSize="option.size"
            :outputType="option.outputType"
            :autoCrop="option.autoCrop"
            :autoCropWidth="option.autoCropWidth"
            :autoCropHeight="option.autoCropHeight"
            :canMoveBox="option.canMoveBox"
            :fixedBox="option.fixedBox"
            ></VueCropper>
        </div>
        <button @click="finish('base64')" class="btn">preview(base64)</button>
        <div class="show-preview" :style="{'width': previews.w + 'px', 'height': previews.h + 'px',  'overflow': 'hidden', 'margin': '5px'}">
            <div :style="previews.div">
                <img :src="previews.url" :style="previews.img">
            </div>
        </div>
  </div>
</template>

<script>
import VueCropper from 'vue-cropper'
// import uploadImg from '@/assets/js/uploadImg'
export default {
    name: 'HelloWorld',
    components:{
        VueCropper
    },
    data () {
        return {
            crap: false,
            previews: {
                div:"background:red;width:200px;height:200px;",
                url:''
            },
            option:{
                img:'https://ss0.baidu.com/94o3dSag_xI4khGko9WTAnF6hhy/image/h%3D300/sign=71f6f27f2c7f9e2f6f351b082f31e962/500fd9f9d72a6059f550a1832334349b023bbae3.jpg',
                outputSize:1,
                outputType:'jpeg',
                canMoveBox: false,
                canMove: true,
                autoCrop:true,
                autoCropWidth: 300,
                autoCropHeight: 300,
                fixedBox:true
            }
        }
    },
    methods:{
        realTime (data) {
            console.log(data);
			this.previews = data
		},
        finish (type) {
			// 输出
			// var test = window.open('about:blank')
			// test.document.body.innerHTML = '图片生成中..'
			if (type === 'blob') {
				this.$refs.cropper.getCropBlob((data) => {
					// var test = window.open('')
					test.location.href = window.URL.createObjectURL(data)
				})
			} else {
				this.$refs.cropper.getCropData((data) => {
					this.previews.url = data
				})
			}
		},
    }
}
</script>


<template>
  <transition name="fade">
        <div class="modal-mask">
          <div class="modal-wrapper">
            <div class="modal-container" v-if="wait">

            <button type="button" class="close modal-default-button" @click="$emit('close')" data-dismiss="modal" aria-label="Close" >
                <span aria-hidden="true">&times;</span>
            </button>
            <div class="mr-0">
                <div class="container d-flex justify-content-center mt-4">
                    <h2>YOUR CART</h2>
                </div>
                
            </div>

            <div class="modal-body d-flex justify-content-center">
                <div class="p-0 w-100 cart-list" v-if="(orders.length > 0 && isAuthenticated)">
                    <div v-for="(order,index) in orders" :key="index">
                    <hr v-if="index>0">
                    <div class="row my-2"  >
                        <div class="image-container col-4 p-0">
                            <img class = "prod-image" :src="order.image" alt="">
                        </div>
                        <div class="info-container col-8 pr-0">
                            <div class=" mb-1 d-flex d-inline-block align-items-center w-100">
                                <h6 class="m-0">Name:</h6>
                                <div class="w-100 pl-2" style="cursor:pointer" @click="$emit('close')"><strong><router-link tag="span" :to="{ name: 'productDetails', params: { id:order.item_id }}">{{ order.name.toUpperCase() }}</router-link></strong></div>
                            </div>
                            <div class=" my-3 d-flex d-inline-block align-items-center w-100">
                                <h6 class="m-0"> Qty:</h6>
                                <div class="w-100 px-2"><span class="mr-2" style="cursor:pointer" @click="order.quantity++"> &#43;</span> {{ order.quantity }} <span class="ml-2" style="cursor:pointer" @click="order.quantity>1?order.quantity-- : 1">&#8722;</span></div>
                            </div>
                            <div class=" mt-1 d-flex d-inline-block align-items-center w-100">
                                <h6 class="m-0">Price:</h6>
                                <div class="w-100 pl-2"><strong> Rs {{ (order.price*order.quantity).toLocaleString() }}</strong></div>
                                <div class="float-right mr-4" @click="deleteOrder(order.item_id,index)"><button class="btn btn-outline-danger" style="border-radius:10px"><i class="fas fa-trash"></i></button></div>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
                <div v-else-if="(orders.length == 0 && isAuthenticated)">
                    <p>Your cart is empty ! Shop Now</p>
                </div>
                <div v-else-if="(!isAuthenticated)">
                    
                                <!-- <div class="modal-footer"> -->
                <div class="container-fluid text-center">
                    <p >Login to add to your cart!</p>
                    <span class="text-secondary "> Have an Account? <a href= "#" class="text-dark" @click="$emit('change','login')">Login</a></span>
                <!-- </div> -->
            </div>
                </div>
            </div>

            <div class="modal-footer">
                <div class="container-fluid text-center" v-if="orders.length>0">
                    <div class="input-group d-flex justify-content-center w-100 mt-4 mb-2 text-center">
                        <button class="btn w-50 py-2 float-right" @click="checkout()" id="loginSubmit">CHECKOUT</button>
                    </div>
                </div>
            </div>
            </div>
          </div>
        </div>
    </transition>
</template>

<script>
import {mapGetters} from 'vuex';
export default {
    data(){
        return {
            orders : [],
            wait: false,
            userData: [],
            userId: null,
            total_amount:0.00,
           
        };
    },
    //  props: ['userId'],


    methods:{
        close(){
            this.$emit('close');
        },
        deleteOrder(item_id,index){
            this.orders.splice(index,1);
            this.$http.delete(`${this.$api}orders/${item_id}`,{ headers: { _id: this.userId}})
                .then(response =>{
                    console.log('Item Deleted');
                })
                .catch(error =>{
                    console.log('error occured');
                });
        },
        checkout(){
            // console.log(this.orders)
            if(this.userId){
                // console.log(this.orders);
                this.total_amount = 0.00
                for(let i=0;i<this.orders.length;i++){
                    this.total_amount += this.orders[i].price*this.orders[i].quantity;
                }
                var params = {
                    amount: this.total_amount,  
                    // amount: 
                    currency: "INR",
                    receipt: "su001",
                    payment_capture: '1'
                };
                this.$http.post(`${this.$api}payment/order`,params)
                    .then(response =>{
                        console.log(response)
                        if(response.data.status == "success"){

                            this.$router.push({ name: 'checkout', params: {orderData: this.orders,paymentDetails: response.data.sub, totalAmount: this.total_amount }})
                            this.$emit('close');
                            
                        }
                    })
                    .catch(err=>{
                        console.log(err);
                        alert('An error occured! Please try again.')
                    })
            } else{
                this.$emit('change','login');
            }
        }
    },
    computed : {
    ...mapGetters(['isAuthenticated','sendData']),
    },
    created(){
        this.userId = this.sendData ? this.sendData.id : null;
        console.log(this.userId)
        this.wait = true;
        if(this.userId){
            this.$http.get(`${this.$api}orders`,{ headers: { _id: this.userId}})
                        .then(response =>{
                            console.log(response.data)
                            this.orders = response.data.foundOrder ? response.data.foundOrder.items : [];
                            console.log("Orders", this.orders)
                        })
                        .catch(error =>{
                            console.log(error);
                            this.order = [];
                        });
        }
    },


}
</script>

<style scoped>

    .prod-image{
        width: 80%;
        height: auto;
        display: flex;
        align-items: center;
    }

    .cart-list{
        overflow-y: scroll;
        overflow-x:hidden;
        max-height: 100%;
    }

    .cart-list::-webkit-scrollbar {
        /* display: none; */
        /* background:black; */
        /* width:10px; */
    }
    .cart-list::-webkit-scrollbar-track
    {
        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
        background-color: #F5F5F5;
    }

    .cart-list::-webkit-scrollbar
    {
        width: 5px;
        background-color: #F5F5F5;
    }

    .cart-list::-webkit-scrollbar-thumb
    {
        background-color: #000000;
        /* border: 2px solid #555555; */
    }




    .cart-list {
        -ms-overflow-style: none;  
        scrollbar-width: none;  
    }


    .modal-mask {
        position: fixed;
        z-index: 9998;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        display: table;
        transition: opacity 0.5s ease-out;
        overflow:hidden
    }

    .modal-wrapper {
        display: flex;
        align-items: center;
        /* padding-top: 10vh; */
        height: 100%;
        max-height : 90vh;
        /* overflow: hidden; */
    }

    .modal-container {
        width: 80%;
        height: 90vh;
        margin: 0px auto;
        padding: 10px 20px;
        background-color: #f2f2f2;
        border-radius: 2px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
        transition: all 0.5s ease-out;
        max-width: 550px;
        max-height: 700px;
        /* overflow: hidden; */
    }

    .modal-header {
        margin-top: 20px;
        border-bottom: 1px solid black;
    }

    .modal-body {
        margin:40px 10px;
        margin-bottom:20px;
        min-height: 50vh;
        max-height: 50vh;
        display: block;
    }
    .modal-footer {
        border-top: 1px solid black;
    }



    .btn {
        border: 1px solid black;
        border-radius: 0;
        background: rgb(0,0,0);
        background: linear-gradient(90deg, rgba(0,0,0,0) 33.33%, rgba(0,0,0,1) 33.33%, rgba(0,0,0,1) 66.66%, rgba(0,0,0,0) 66.66%);
        background-size: 300%;
        background-position: 50% 100%;
        transition: all 0.45s cubic-bezier(0.785, 0.135, 0.15, 0.86);
        color: white;
    }
    .btn:hover{

        background-position: 100% 100%;
        animation: slide-in 0.45s cubic-bezier(0.785, 0.135, 0.15, 0.86);
        color: black;

    }

    @keyframes slide-in {
        from {
            background-position: 50% 100%;
        }

        to {
            background-position: 0% 100%;
        }

    }


    
    .modal-default-button {
        float: right;
    }


    .fade-enter, .fade-leave-to  {
        opacity: 0;
    }
    .fade-enter-active, .fade-leave-active {
        transition: opacity 0.5s;
    }

</style>
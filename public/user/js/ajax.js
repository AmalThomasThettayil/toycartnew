function addCart() {
    Swal.fire({
        title: 'Product added to cart!',
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
    }).then((result) => {

    })
}
function add_to_cart(proId){
    $.ajax({
        url:'/add-tocart/'+proId,
        method:'get',   
        success:(response)=>{
            if(response.msg){  
                addCart()             
                let count=$('#cart-count').html()
                counts=parseInt(count)+1
                $('#cart-count').html(counts)
            }else{
                firstlogedin()
            }            
        }
    })
}
function removeProductFromWish(wishid) {   
    $.ajax({
        url: '/ProductFromWish',
        data: {
            wishid: wishid
        }, method: 'delete',
        success: (response) => {
            removeWish()
        }
    })
}
function removeWish() {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",               
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Remove',
        showCancelButton: true
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                'Deleted!',
                'Your file has been deleted.',
                'success'
            ).then(() => {
                location.reload()
              
                
            })
        }})
}
function addwishlist() {
    Swal.fire({
        title: 'Product added to wishlist!',
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
    }).then((result) => {

    })
}

function firstlogedin() {
    Swal.fire({
        title: 'PLease login first!',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
    }).then((result) => {
        location.href = '/uLogin'

    })
}
function alreadyInWish() {
    Swal.fire({
        title: 'Item already added!',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
    }).then((result) => {


    })
}
function add_to_wishlist(proId) {
    $.ajax({
        url: '/addToWishlist/' + proId,
        method: 'get',
        success: (response) => {                   
            if (response.msg) {
                addwishlist()
            } else if (response.err) {
                alreadyInWish()
            }else{
                firstlogedin()
            }
        }
    })
}

    function removeProductFromCart(cartid) {
      $.ajax({
        url: '/removeProductFromCart',
        data: {
          cartid: cartid
        }, method: 'post',
        success:(response) => {
            if(response){             
            removeCart() 
        }        
        }
      })
    } 
    function removeCart() {        
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",               
            icon: 'warning',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Remove',
            showCancelButton: true
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire(
                    'Deleted!',
                    'Product has been removed from cart.',
                    'success'
                ).then(() => {
                    location.reload()
                })
        }
    })}
    

const client = contentful.createClient({
    // This is a space ID. A space is like a project
    //folder in contentful terms
    space: "2ys5z3u35hqb",
    // This is the access token for this space. Normally 
    // you get both ID and the token in the contentful web
    // app
    accessToken: "Wbrb5CdBByPdlnFusGaY6R6XH2fkHBGxaZVKNJ9fqwE"
});

//Variables
const basketBtn = document.querySelector('.basket-btn');
const closeBasketBtn = document.querySelector('.close-basket');
const clearBasketBtn = document.querySelector('.clear-basket');
const basketDOM = document.querySelector('.basket');
const basketOverlay = document.querySelector('.basket-overlay');
const basketItems = document.querySelector('.basket-items');
const basketTotal = document.querySelector('.basket-total');
const basketContent = document.querySelector('.basket-content');
const dishesDOM = document.querySelector('.dishes-center');

// CART
let basket = [];

// BUTTONS
let buttonsDOM = [];

/**
 * product class is responsible for getting the data locally and from contentful
 */
class Dish
 {
    async getDishes() 
    {
        try 
        {
             let contentful = await client.getEntries({
                 content_type: "naijaDishes"
             })
            let result = await fetch('dishes.json');
            let data = await result.json();
           // let dishes = data.items;

            let dishes = contentful.items;

            dishes = dishes.map(item => 
                {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { title, price, id, image }
            })
            console.log(dishes);
            return dishes;


        }
        catch (error) 
        {
            alert('Error in fetching data from the storage');
            console.log(error);
        }
    }
}

class Storage 
{
    static saveDishes(dishes) 
    {
        localStorage.setItem("dishes", JSON.stringify(dishes));

    }
    static getDishes(id)
    {
        let dishes = JSON.parse(localStorage.getItem("dishes"));
        let dish = dishes.find(dish => dish.id === id);
        return dish;
    }
    static saveBasket(basket)
    {
        localStorage.setItem("basket", JSON.stringify(basket));
    }
    static getBasket() 
    {
        return localStorage.getItem("basket") ? JSON.parse(localStorage.getItem("basket")) : [];
    }
}



class UI
{
    displayDishes(dishes)
    {
        let result = '';
        dishes.forEach(dish =>
            {
                result += 

                `
                
                                 <article class="dishes">
                                <div class="img-container">
                                         <img src="${dish.image}" alt="dish" class="dishes-img">
                                         <button class="bag-btn" data-id=${dish.id}>
                                             <i class="fas fa-shopping-basket"></i>
                                             add to basket
                                         </button>
                                     </div>
                                     <h3>${dish.title}</h3>
                                     <h4><span>&#8358;</span>${dish.price}</h4>
                                 </article> 
                                
                `
               
                dishesDOM.innerHTML = result;
            });
    }

    getBagButtons()
    {
        const buttons = [...document.querySelectorAll('.bag-btn')]; // Returns an array instead of a node list.
        buttonsDOM = buttons;
        buttons.forEach(button =>
            {
                let id = button.dataset.id;
                let inBasket = basket.find(item => item.id === id);
                if(inBasket)
                {
                    button.innerText = 'In basket';
                    button.disabled = true;
                }
                
                
                button.addEventListener('click', event =>
                    {
                        event.target.innerText = 'In basket';
                        event.target.disabled = true;

                        // get product from products
                        let basketItem = {...Storage.getDishes(id),amount: 1};
                        // add product to the cart
                        basket = [...basket,basketItem];
                        console.log(basket);
                        // save cart in local storage_
                        Storage.saveBasket(basket);
                        // set cart values
                        this.setBasketValues(basket);
                        // display cart items
                        this.addBasketItem(basketItem)
                        // show the cart
                        this.showBasket();
                        });
                
            });
        //console.log(buttons);
    }
    setBasketValues(basket)
    {
        let tempTotal = 0;
        let itemsTotal = 0;
        basket.map(item =>
            {
                tempTotal += item.price * item.amount;
                itemsTotal += item.amount;
            })
        basketTotal.innerText = parseFloat(tempTotal.toFixed(2));
        basketItems.innerText = itemsTotal
       

    }
    addBasketItem(item)
    {
        const div = document.createElement('div');
        div.classList.add('basket-item');
        div.innerHTML =

        `
          <img src="${item.image}" alt="dish">
           <div>
              <h4>${item.title}</h4>
              <h5><span>&#8358;</span>${item.price}</h5>
               <span class="remove-item" data-id=${item.id}>remove</span>
           </div>
           <div>
               <i class="fas fa-chevron-up" data-id=${item.id}></i>
               <p class="item-amount">${item.amount}</p>
               <i class="fas fa-chevron-down" data-id=${item.id}></i>
           </div>
          
           `;
       
        
        basketContent.appendChild(div);
      
    }
    showBasket()
    {
        basketOverlay.classList.add('transparentBcg')
        basketDOM.classList.add('showBasket');
    }
    hideBasket()
    {
        basketOverlay.classList.remove('transparentBcg');
        basketDOM.classList.remove('showBasket');
    }
    clearBasket()
    {
        let basketItems = basket.map(item => item.id);
        basketItems.forEach(id =>  this.removeItem(id));
        while(basketContent.children.length > 0)
        {
            basketContent.removeChild(basketContent.children[0]);
        }
          this.hideBasket();  
    }
    populateBasket()
    {
        basket.forEach(item => this.addBasketItem(item));
    }
    removeItem(id)
    {
        basket = basket.filter(item => item.id !== id)
        this.setBasketValues(basket);
        Storage.saveBasket(basket);

        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML =
        `
        <i class="fas fa-shopping-cart"></i>
        add to basket
        `
    }
    getSingleButton(id)
    {
        return buttonsDOM.find(button => button.dataset.id === id);
    }
  
  
    setupAPP()
    {
        basket = Storage.getBasket();
        this.setBasketValues(basket);
        this.populateBasket(basket);
        basketBtn.addEventListener('click', this.showBasket);
        closeBasketBtn.addEventListener('click', this.hideBasket);
    }
    
    
    basketLogic()
    {
        clearBasketBtn.addEventListener('click', () =>
        {
            this.clearBasket();
        })
        basketContent.addEventListener('click', event =>
        {
            if(event.target.classList.contains('remove-item'))
            {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                basketContent.removeChild(removeItem.parentElement.parentElement);
               
                this.removeItem(id);
            }
            else if (event.target.classList.contains('fa-chevron-up'))
            {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = basket.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveBasket(basket);
                this.setBasketValues(basket);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }
            else if(event.target.classList.contains('fa-chevron-down'))
            {
               
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = basket.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if(tempItem.amount > 0)
                {
                    Storage.saveBasket(basket);
                    this.setBasketValues(basket);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                }
                else
                {
                    basketContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }

        })
    }
   

}
    






document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const dishes = new Dish();
    ui.setupAPP();
    dishes.getDishes()
    .then(dishes => 
        {
            ui.displayDishes(dishes);
            Storage.saveDishes(dishes);
       })
       .then( () =>
       {
           ui.getBagButtons();
           ui.basketLogic();
       })



})
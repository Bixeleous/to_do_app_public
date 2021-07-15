//Browser based js

//item template(*) - to generate html
function itemTemplate(item) {
  return `
       <li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
              <span class="item-text">${item.text}</span>
              <div>
                <button class="edit-me btn btn-secondary btn-sm mr-1" data-id="${item._id}" >Edit</button>
                <button class="delete-me btn btn-danger btn-sm" data-id="${item._id}">Delete</button>
              </div>
       </li>
  `
}

//initial page load render
let ourHTML = items //data(2*) from server
  .map(function (item) {
    return itemTemplate(item) //using the template(*) to create html for each item
  })
  .join("") //removing the comma

document.getElementById("item-list").insertAdjacentHTML("beforeend", ourHTML) //inserting the HTML in item-list

//Create Feature
let createField = document.getElementById("create-field") //data(3*)
document.getElementById("create-form").addEventListener("submit", function (e) {
  e.preventDefault() //prevent default behaviour of form
  if (createField.value) {
    //axios request to server sending data(3*) to create item
    axios
      .post("/create-item", { text: createField.value })
      .then(function (response) {
        //browser side js - creating new item html
        document.getElementById("item-list").insertAdjacentHTML("beforeend", itemTemplate(response.data))
        createField.value = ""
        createField.focus()
      })
      .catch(function () {
        console.log("Please try again later.") //error checking
      })
  }
})

//Update Feature
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("edit-me")) {
    //data(4*)
    let userInput = prompt("Enter your desired new text", e.target.parentElement.parentElement.querySelector(".item-text").innerHTML)
    if (userInput) {
      //axios request to server sending data(4*) to udpadte item
      axios
        .post("/update-item", { text: userInput, id: e.target.getAttribute("data-id") }) //data-id to see which item will be upadted
        .then(function () {
          e.target.parentElement.parentElement.querySelector(".item-text").innerHTML = userInput //browser side js updating html
          // console.log(e.target.getAttribute("data-id"))
        })
        .catch(function () {
          console.log("Please try again later.") //error checking
        })
    }
  }
})

//Delete Feature
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("delete-me")) {
    if (confirm("Do you want to delete this item permanently?")) {
      axios
        .post("/delete-item", { id: e.target.getAttribute("data-id") }) //data-id to see which item will be deleted
        .then(function () {
          e.target.parentElement.parentElement.remove() //browser side js removing html
        })
        .catch(function () {
          console.log("Please try again later.") //error checking
        })
    }
  }
})

const cl = console.log;

const cardContainer = document.getElementById('cardContainer');
const submitpost = document.getElementById("submitpost");
const updatepot = document.getElementById("updatepot");
const postForm = document.getElementById("postForm");
const titlecontrol = document.getElementById("title");
const bodycontrol = document.getElementById("body");
const useridcontrol = document.getElementById("userId");
const spiner = document.getElementById('spiner');

//  Spinner Controls
const showSpinner = () => spiner.classList.remove("d-none");
const hideSpinner = () => spiner.classList.add("d-none");

//  Snackbar Fix using SweetAlert
const snackBar = (msg, icon) => {
  Swal.fire({
    title: icon === "success" ? "Success" : "Error",
    text: msg,
    icon: icon,
    timer: 2000,
    showConfirmButton: false
  });
};

let BASE_URL = `https://crud-27f49-default-rtdb.firebaseio.com`;
let POST_URL = `${BASE_URL}/posts.json`;

const templeting = array => {
  let result = ``;
  array.forEach(element => {
    result += `
      <div class="card mb-3" id="${element.firebaseKey}">
          <div class="card-header">
              <h3 class="m-0">${element.title}</h3>
          </div>
          <div class="card-body">
              <p class="m-0">${element.body}</p>
          </div>
          <div class="card-footer d-flex justify-content-between">
              <button class="btn btn-sm btn-outline-primary" onclick="onEdit(this)">EDIT</button>
              <button class="btn btn-sm btn-outline-danger" onclick="onRemove(this)">REMOVE</button>
          </div>
      </div>`;
  });
  cardContainer.innerHTML = result;
};

// Fetch All Posts
const fetchAllPosts = () => {
  showSpinner();
  fetch(POST_URL, {
    method: "GET",
    headers: {
      "Content-type": "application/json",
      "Auth": "JWT token from LS !!!"
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("Network Error !!!!!!");
      return res.json();
    })
    .then(data => {
      let postArr = [];
      for (let key in data) {
        postArr.push({
          ...data[key],
          firebaseKey: key
        });
      }
      templeting(postArr);
    })
    .catch(err => {
      cl(err);
      snackBar("Failed to fetch posts", "error");
    })
    .finally(() => hideSpinner());
};

fetchAllPosts();

const createCard = (res) => {
  let card = document.createElement('div');
  card.className = 'card mb-3';
  card.id = res.firebaseKey || res.id;
  card.innerHTML = `
      <div class="card-header">
          <h3 class="m-0">${res.title}</h3>
      </div>
      <div class="card-body">
          <p class="m-0">${res.body}</p>
      </div>
      <div class="card-footer d-flex justify-content-between">
          <button class="btn btn-sm btn-outline-primary" onclick="onEdit(this)">EDIT</button>
          <button class="btn btn-sm btn-outline-danger" onclick="onRemove(this)">REMOVE</button>
      </div>
  `;
  cardContainer.prepend(card);
};

const onEdit = (ele) => {
  const EDIT_ID = ele.closest('.card').id;
  localStorage.setItem('EDIT_ID', EDIT_ID);

  const EDIT_URL = `${BASE_URL}/posts/${EDIT_ID}.json`;

  showSpinner();
  fetch(EDIT_URL, {
    method: "GET",
    headers: {
      "Content-type": "application/json",
      Auth: "JWT token from LS"
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("Network Error");
      return res.json();
    })
    .then(data => {
      if (data) {
        titlecontrol.value = data.title;
        bodycontrol.value = data.body;
        useridcontrol.value = data.userId;

        postForm.setAttribute("data-edit-id", EDIT_ID);
           window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
        submitpost.classList.add("d-none");
        updatepot.classList.remove("d-none");
     
      } else {
        snackBar("No data found for this post", "error");
      }
    })
    .catch(err => {
      cl(err);
      snackBar("Failed to load post for editing", "error");
    })
    .finally(() => hideSpinner());
};

const onRemove = (ele) => {
  Swal.fire({
    title: "Are you sure?",
    text: "This will delete the post permanently!",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!"
  }).then(result => {
    if (result.isConfirmed) {
      const REMOVE_ID = ele.closest('.card').id;
      const REMOVE_URL = `${BASE_URL}/posts/${REMOVE_ID}.json`;

      const CONFIG_OBJ = {
        method: "DELETE",
        headers: {
          "Content-type": "application/json",
          Auth: "JWT token from LS !!!"
        }
      };

      showSpinner();
      fetch(REMOVE_URL, CONFIG_OBJ)
        .then(res => {
          if (!res.ok) throw new Error("Network Error !!!!!!");
          return res.json();
        })
        .then(() => {
          ele.closest('.card').remove();
          snackBar("Post deleted successfully", "success");
        })
        .catch(err => {
          cl(err);
          snackBar("Failed to delete post", "error");
        })
        .finally(() => hideSpinner());
    }
  });
};

const onAddBlog = (eve) => {
  eve.preventDefault();
  showSpinner();
  const blogObj = {
    title: titlecontrol.value,
    body: bodycontrol.value,
    userId: useridcontrol.value
  };

  const CONFIG_OBJ = {
    method: "POST",
    body: JSON.stringify(blogObj),
    headers: {
      "Content-type": "application/json",
      Auth: "JWT token from LS !!!"
    }
  };

  fetch(POST_URL, CONFIG_OBJ)
    .then(res => {
      if (!res.ok) throw new Error("Network Error !!!!!!");
      return res.json();
    })
    .then(res => {
      const newBlog = {
        ...blogObj,
        firebaseKey: res.name
      };
      createCard(newBlog);
      snackBar("Card created successfully", "success");
    })
    .catch(err => {
      cl(err);
      snackBar("Failed to create post", "error");
    })
    .finally(() => {
      hideSpinner();
      postForm.reset();
    });
};

const onUpdate = () => {
  showSpinner();
  const UPDATE_ID = localStorage.getItem('EDIT_ID');
  const UPDATE_URL = `${BASE_URL}/posts/${UPDATE_ID}.json`;

  const UPDATE_OBJ = {
    title: titlecontrol.value,
    body: bodycontrol.value,
    userId: useridcontrol.value,
    id: UPDATE_ID
  };

  const CONFIG_OBJ = {
    method: "PATCH",
    body: JSON.stringify(UPDATE_OBJ),
    headers: {
      "Content-type": "application/json",
      Auth: "JWT token from LS !!!"
    }
  };

  fetch(UPDATE_URL, CONFIG_OBJ)
    .then(res => {
      if (!res.ok) throw new Error("Network Error !!!!!!");
      return res.json();
    })
    .then(data => {
      const card = document.getElementById(UPDATE_ID);
      card.querySelector('.card-header h3').innerHTML = data.title;
      card.querySelector('.card-body p').innerHTML = data.body;

      snackBar("Post updated successfully", "success");

      postForm.reset();
      submitpost.classList.remove('d-none');
      updatepot.classList.add('d-none');
    })
    .catch(err => {
      cl(err);
      snackBar("Failed to update post", "error");
    })
    .finally(() => hideSpinner());
};

updatepot.addEventListener('click', onUpdate);
postForm.addEventListener('submit', onAddBlog);

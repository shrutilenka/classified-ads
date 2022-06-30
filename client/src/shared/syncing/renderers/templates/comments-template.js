

/* <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script> */
export const commentsTemplate = `
    <% for (var i = 0; comments.length> 0 && i < comments.length && i < 10 ; i++) { %>
        <div x-data="{ open: false }" id="<%= comments[i]._id %>">



            <% if (comments[i].from === user.nickname) { %>
                <div class="comment comment-darker" x-on:click="open = ! open">
                    <img src="/images/1546457182.svg" alt="<%= comments[i].from %>" class="right">
                    <p><%= comments[i].message %></p>
                    <span class="comment-time-left"><%= new Date(parseInt(comments[i]._id.toString().substring(0, 8), 16) * 1000).toISOString().slice(0,10) %></span>
                </div>
            <% } else { %>
                <div class="comment" x-on:click="open = ! open">
                <img  alt="Red dot" />
                    <img src="/images/1546457622.svg" alt="<%= comments[i].from %>">
                    <p><%= comments[i].message %></p>
                    <span class="comment-time-right"><%= new Date(parseInt(comments[i]._id.toString().substring(0, 8), 16) * 1000).toISOString().slice(0,10) %></span>
                </div>
            <% }%>

            <% if (typeof user != 'undefined') { %>
                <span x-show="open" x-transition>
                    <div class="comment comment-reply">
                        <div>
                            <button class="btn btn-primary my-2 w-25" value="replyTo" onclick="postComment('<%= comments[i]._id %>')">Reply to this ...</button>
                        </div>
                    </div>
                </span>
            <% }%>


            
        </div>
    <% }%>

    <form id="commentForm" name="addComment">
        <div>
            <label for="message">Reply...</label>
            <textarea class="w-100" rows="3" name="message" id="message"></textarea>
        </div>
        <input type="submit" onclick="postComment()">
    </form>
`
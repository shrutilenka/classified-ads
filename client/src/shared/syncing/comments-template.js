export const commentsTemplate = `
    <% for (var i = 0; comments.length> 0 && i < comments.length && i < 10 ; i++) { %>
        <div x-data="{ open: false }" id="<%= comments[i]._id %>">
            <% if (comments[i].from === user.nickname) { %>
                <div class="chat chat-darker" x-on:click="open = ! open">
                    <img src="https://www.w3schools.com/w3images/avatar_g2.jpg" alt="<%= comments[i].from %>" class="right">
                    <p><%= comments[i].message %></p>
                    <span class="chat-time-left"><%= new Date(parseInt(comments[i]._id.toString().substring(0, 8), 16) * 1000).toISOString().slice(0,10) %></span>
                </div>
            <% } else { %>
                <div class="chat" x-on:click="open = ! open">
                    <img src="https://www.w3schools.com/w3images/avatar_g2.jpg" alt="<%= comments[i].from %>">
                    <p><%= comments[i].message %></p>
                    <span class="chat-time-right"><%= new Date(parseInt(comments[i]._id.toString().substring(0, 8), 16) * 1000).toISOString().slice(0,10) %></span>
                </div>
            <% }%>
            <!-- TODO: only if author is the logged in user/ reply section -->
            <% if (author === user.nickname) { %>
                <span x-show="open" x-transition>
                    <div class="chat chat-reply">
                        <form action="comment" method="POST">
                            <div>
                                <label for="message">Reply...</label>
                                <textarea class="w-100" rows="3" name="message" id="message"></textarea>
                            </div>
                            <div>
                                <button class="btn btn-primary my-2 w-25">Send</button>
                            </div>
                        </form>
                    </div>
                </span>
            <% }%>
            <input type="button" value="replyTo" onclick="updateCommentId(<%= comments[i]._id %>)">
        </div>
    <% }%>
`
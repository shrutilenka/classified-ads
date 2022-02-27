export const topTagsTemplate = `
    <% for (var i = 0; tags.length> 0 && i < tags.length && i < 10 ; i++) { %>
        <div class="w-100 d-inline">
            <a href="/division/<%=tags[i].tag %>"><span class="badge bg-secondary"><%=tags[i].tag %></span></a>
        </div>
    <% }%>    
`
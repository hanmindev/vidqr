
function User() {

}


function UserList() {
    const userList = [
        {username: "user1", role: "host"},
    ]

    return (
        <div className="userList">
            <h3>Users</h3>
            <div className="userListContainer">
                <div className="userListEntry">
                    <b className="text-3xl font-bold underline">Username</b>
                    <b>Role</b>
                </div>
            </div>
        </div>
    )
}
export default UserList;
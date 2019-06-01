import { Role } from './'
import { handleResponse } from '@/_helpers';


export function configureFakeBackend() {
    const requestOptions = {
        method: 'Get',
        headers: { 'Content-Type': 'application/json' },

        //body: JSON.stringify({ username, password })
    };
    let users = []
    //fill this array if server is not working or for local test or uncomment the lines below
    // [
    //     { id: 1, username: 'admin', password: 'admin', firstName: 'Admin', lastName: 'User', role: Role.Admin },
    //     { id: 2, username: 'user', password: 'user', firstName: 'Normal', lastName: 'User', role: Role.User }
    // ];

    //get users from server and pass them to the local users array
    fetch('http://localhost:5000/api/users',requestOptions).then(handleResponse).then(userss=>{
        const UsersData = JSON.parse(userss.express)
        let userinfo = UsersData["recordset"];
        userinfo.forEach(element => {
            users.push(element)
        });
        console.log(users);
    })
    let realFetch = window.fetch;
    window.fetch = function (url, opts) {
        debugger
        const authHeader = opts.headers['Authorization'];
        const isLoggedIn = authHeader && authHeader.startsWith('Bearer 14569871234569871688');
        const roleString = isLoggedIn && authHeader.split('.')[1];
        const role = roleString ? Role[roleString] : null;

        return new Promise((resolve, reject) => {
            // wrap in timeout to simulate server api call
            setTimeout(() => {
                // authenticate - public
                if (url.endsWith('/users/authenticate') && opts.method === 'POST') {
                    const params = JSON.parse(opts.body);
                    const user = users.find(x => x.UserName === params.username && x.Password === params.password);
                    if (!user) return error('Username or password is incorrect');
                    return ok({
                        id: user.UserSerial,
                        username: user.UserName,
                        firstName: user.First_Name,
                        lastName: user.Second_Name,
                        role: user.RoleName,
                        token: `14569871234569871688.${user.RoleName}`
                    });
                }

                // get user by id - admin or user (user can only access their own record)
                if (url.match(/\/users\/\d+$/) && opts.method === 'GET') {
                    if (!isLoggedIn) return unauthorised();

                    // get id from request url
                    let urlParts = url.split('/');
                    let id = parseInt(urlParts[urlParts.length - 1]);

                    // only allow normal users access to their own record
                    const currentUser = users.find(x => x.RoleName === role);
                    if (id !== currentUser.id && role !== Role.Admin) return unauthorised();

                    const user = users.find(x => x.id === id);
                    return ok(user);
                }

                // get all users - admin only
                if (url.endsWith('/users') && opts.method === 'GET') {
                    if (role !== Role.Admin) return unauthorised();
                    return ok(users);
                }

                // pass through any requests not handled above
                realFetch(url, opts).then(response => resolve(response));

                // private helper functions

                function ok(body) {
                    resolve({ ok: true, text: () => Promise.resolve(JSON.stringify(body)) })
                }

                function unauthorised() {
                    resolve({ status: 401, text: () => Promise.resolve(JSON.stringify({ message: 'Unauthorised' })) })
                }

                function error(message) {
                    resolve({ status: 400, text: () => Promise.resolve(JSON.stringify({ message })) })
                }
            }, 500);
        });
    }
}
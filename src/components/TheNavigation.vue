<template>
    <div id="nav">
        <header class="nav-header">

            <h2></h2>

            <input class="switcher" id="menu" type="checkbox">
            <label class="open" for="menu">
                <font-awesome-icon icon="bars"/>
            </label>

            <nav>
                <ul>
                    <li>
                        <router-link to="/">About</router-link>
                    </li>
                    <!--<li>-->
                        <!--<router-link to="#">Projects</router-link>-->
                    <!--</li>-->
                    <!--<li>-->
                        <!--<router-link to="#">Skills</router-link>-->
                    <!--</li>-->
                    <li>
                        <router-link to="/portfolio">Portfolio</router-link>
                    </li>
                    <li>
                        <router-link to="/contacts">Contacts</router-link>
                    </li>
                </ul>
                <label class="close" for="menu">
                    <font-awesome-icon icon="times"/>
                </label>
            </nav>
        </header>
    </div>
</template>

<script>
    export default {
        name: "TheNavigation"
    }
</script>

<style lang="scss" scoped>
    .nav-header {
        position: sticky !important;
        z-index: 1;
        top: 0;

        min-height: 100px;
        background: #333;
        padding: 0 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 4px 4px 0 rgba(0, 0, 0, .2);


        .switcher {
            position: absolute;
            visibility: hidden;
            left: -9999px;
        }

        label {
            font-size: 30px;
            cursor: pointer;
            display: none;
        }

        ul {
            list-style-type: none;
            display: flex;
        }

        a {
            font-size: 15px;
            font-weight: bold;
            font-family: 'Montserrat', sans-serif;
            letter-spacing: 2px;
            color: #ddd;
            display: block;
            text-transform: uppercase;
            text-decoration: none;
            padding: 0 15px;
            transition: .4s;


            &:hover {
                color: #3498db;
            }
        }
    }

    @media screen and (max-width: 800px) {
        .open,
        .close {
            display: block !important;
        }

        .close {
            position: absolute;
            top: 40px;
            right: 40px;
        }

        .switcher:checked ~ nav {
            right: 0;
        }

        nav {
            position: fixed;

            width: 100%;
            height: 100vh;
            background: linear-gradient(#000000, #B82E1F);
            right: -100%;
            top: 0;
            text-align: center;
            padding: 100px 0;
            transition: .2s; /*.7s*/
        }

        ul {
            flex-direction: column;

            a {
                padding: 10px !important;

                &:hover {
                    background-color: rgba(255, 255, 255, .03);
                }
            }
        }
    }

    @media only screen and (min-width: 1680px) {
        .nav-header {
            a {
                font-size: 23px;
            }
        }
    }
</style>

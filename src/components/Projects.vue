<!-- semantic UI is used for cards-->
<template>
    <div class="wrapper">
        <div class="ui cards">

            <ProjectCard :name="`Geo Jobs`"
                         :headerLink="`https://devpost.com/software/geojobs`"
                         :mainImageLink="require(`@/server/portfolio/geojobs2.png`)"
                         :extraImageLink="require(`@/server/portfolio/collins.png`)">
                <template v-slot:description>
                    <p> This service aggregates and visualizes data about job postings for different
                        technologies across the US. You are able to see where exactly in the US which programming
                        skills are in more demand.
                    </p>
                </template>
            </ProjectCard>

            <ProjectCard :name="`Game of grants`"
                         :headerLink="`https://devpost.com/software/gameofgrants`"
                         :mainImageLink="require(`@/server/portfolio/gameOfGrants.png`)"
                         :extraImageLink="require(`@/server/portfolio/mit_winner.png`)">
                <template v-slot:description>
                    <ul>
                        <li> Some investors raised a good amount of money in cryptocurrency and sometimes they want to
                            see a good social or scientific outcome out of it.
                            This platform is their chance to finance any research they are interested in, or make a
                            proposal
                            to find a researcher who is willing to do this kind of research.
                        </li>
                        <li> The project provides a platform that allows professors to connect with investors, so
                            professors
                            could be sponsored by them getting a grant in cryptocurrency.
                        </li>
                        <li> The research is tend to be focus on blockchain/blockchain-related technologies but not
                            limited to.
                        </li>
                    </ul>
                </template>
            </ProjectCard>

            <ProjectCard :name="`FAAN(G) Jobs Locations`"
                         :headerLink="`https://konstantinbiryukov.github.io/geo_jobs/`"
                         :mainImageLink="require(`@/server/portfolio/faang.png`)">
                <template v-slot:description>
                    <ul>
                        <li> This project demonstrates where exactly in the US software developer jobs that such
                            companies as Facebook, Apple,
                            Amazon, Netflix offer are located
                        </li>
                        <li> The data was scraped from official job boards websites:</li>
                        <li>facebook.com/careers/</li>
                        <li>amazon.jobs</li>
                        <li>jobs.netflix</li>
                        <li>apple.com/jobs</li>
                        <li> The data was geocoded into the coordinates of the office locations
                            across the US, aggregated into a singe platform, and visualized onto the interactive map
                        </li>
                    </ul>
                </template>
            </ProjectCard>

            <ProjectCard :name="`'The Last of Us' Map`"
                         :headerLink="`https://konstantinbiryukov.github.io/last-of-us-map/`"
                         :mainImageLink="require(`@/server/portfolio/last_of_us.png`)">
                <template v-slot:description>
                    <ul>
                        <li>'The Last of Us' interactive map experience`</li>
                        <li> There're 2 modes:</li>
                        <li> I. "Follow The Last of Us Path" Mode will guide you through the route that Joel and Ellie
                            has followed throughout the game. Just sit and enjoy their path recalling bygone events.
                        </li>
                        <li> II. Interactive Map Mode will show you the locations which took place in the game. Click
                            on the location markers to check out card-descriptions which let you refresh your memory.
                        </li>
                        <li> * Made with Vue (+Vuex, VueRouter, VueFlux), Mapbox-gl.js, Howler.js</li>
                    </ul>

                </template>
            </ProjectCard>

            <ProjectCard :name="`Phone Book`"
                         :mainImageLink="require(`@/server/portfolio/phone_book.png`)">
                <template v-slot:description>
                    <ul>
                        <li>A CRUD web application that keeps track the list of phone contacts.</li>
                        <li> - Built with all modern front-end techniques and material design concepts using nice
                            Vuetify design.
                        </li>
                        <li> - Leveraged Vue and Vuetify to create mobile-first responsive user interface.</li>
                        <li> - Built RPC-based architecture with and advanced filtration and validation using
                            Express.js.
                        </li>
                    </ul>

                    <div class="ui inverted segment">
                        <router-link to="/phoneBook">
                            <button class="ui inverted red button">Check out the project</button>
                        </router-link>
                    </div>

                </template>
            </ProjectCard>




            <!--<div class="black ui card" @click="transition">-->
            <!--<div class="content">-->
            <!--<a class="header" target="_blank" href="https://devpost.com/software/geojobs">Geo Jobs</a>-->
            <!--</div>-->
            <!--<div class="image">-->
            <!--&lt;!&ndash;<a href="https://devpost.com/software/geojobs">&ndash;&gt;-->
            <!--<img src="../assets/portfolio/geojobs2.png" alt="Geo_Jobs">-->
            <!--&lt;!&ndash;</a>&ndash;&gt;-->
            <!--</div>-->
            <!--<div class="content">-->
            <!--<div class="description">-->
            <!--Description: service that aggregates and visualizes data about job postings for different-->
            <!--technologies across the US. You are able to see where in the country your skills are in more-->
            <!--demand-->
            <!--</div>-->
            <!--</div>-->
            <!--<img class="ui large image" src="../assets/portfolio/collins.png" alt="CollinsAerospace_Award">-->
            <!--</div>-->

            <!--<div class="black ui card">-->
            <!--<div class="content">-->
            <!--<a class="header" target="_blank" href="https://konstantinbiryukov.github.io/geo_jobs/"> FAANG jobs-->
            <!--Location</a>-->
            <!--</div>-->
            <!--<div class="image">-->
            <!--<img src="../assets/portfolio/faang.png" alt="Geo_Jobs">-->
            <!--</div>-->
            <!--<div class="content">-->
            <!--<div class="description">-->
            <!--Description: You can see where exactly all US jobs that such companies as Facebook, Apple, Amazon,-->
            <!--Netflix, Google offer are located-->
            <!--</div>-->
            <!--</div>-->
            <!--</div>-->

            <!--<div class="black ui card">-->
            <!--<div class="content">-->
            <!--<a class="header" target="_blank" href="#">-->
            <!--Phone Book SPA-->
            <!--</a>-->
            <!--</div>-->
            <!--<div class="image">-->
            <!--<img src="../assets/portfolio/phone_book.png" alt="Phone_Book">-->
            <!--</div>-->
            <!--<div class="content">-->
            <!--<div class="description">-->
            <!--Description: You can see where exactly all US jobs that such companies as Facebook, Apple, Amazon,-->
            <!--Netflix, Google offer are located-->
            <!--</div>-->
            <!--</div>-->
            <!--</div>-->

            <!--<div class="black ui card">-->
            <!--<div class="content">-->
            <!--<a class="header" target="_blank" href="https://devpost.com/software/gameofgrants">-->
            <!--Game of Grants-->
            <!--</a>-->
            <!--</div>-->
            <!--<div class="image">-->
            <!--<img src="../assets/portfolio/gameOfGrants.png" alt="Game_of_Grants">-->
            <!--</div>-->
            <!--<div class="content">-->
            <!--<div class="description">-->
            <!--Description: You can see where exactly all US jobs that such companies as Facebook, Apple, Amazon,-->
            <!--Netflix, Google offer are located-->
            <!--</div>-->
            <!--</div>-->
            <!--<img class="ui large image" src="../assets/portfolio/mit_winner.png" alt="CollinsAerospace_Award">-->
            <!--</div>-->

        </div>


        <!--<div class="wrapper">-->
        <!--<div class="container">-->

        <!--&lt;!&ndash;<div class="flex-container">&ndash;&gt;-->
        <!--<a target="_blank" href="https://devpost.com/software/geojobs" class="card flex-container">-->
        <!--&lt;!&ndash;<div class="box">&ndash;&gt;-->
        <!--<h3>Geo Jobs</h3>-->
        <!--<img src="../assets/portfolio/geojobs2.png" alt="Geo_Jobs" class="project-image">-->
        <!--<div>-->
        <!--Description: service that would aggregate and visualize data about job postings for different-->
        <!--technologies across the US. You are able easily see where in the country your skills are in more demand-->
        <!--</div>-->
        <!--<img src="../assets/portfolio/collins.png" alt="CollinsAerospace_Award" class="award-image">-->
        <!--&lt;!&ndash;</div>&ndash;&gt;-->
        <!--</a>-->
        <!--&lt;!&ndash;</div>&ndash;&gt;-->

        <!--<div class="card">-->
        <!--<div class="box">-->
        <!--<h3>CSS</h3>-->
        <!--<img src="../assets/portfolio/geojobs.png" alt="Geo_Jobs" class="project-image">-->
        <!--<div>-->
        <!--Description: service that would aggregate and visualize data about job postings for different-->
        <!--technologies across the US. You are able easily see where in the country your skills are in more demand-->
        <!--</div>-->

        <!--</div>-->
        <!--</div>-->

        <!--<div class="card">-->
        <!--<div class="box">-->
        <!--<h3>JS</h3>-->
        <!--</div>-->
        <!--</div>-->

        <!--</div>-->
        <!--</div>-->
    </div>
</template>

<script>
    import ProjectCard from "@/components/ProjectCard";

    export default {
        name: "Projects",
        components: {
            ProjectCard
        }
    }
</script>

<style scoped lang="scss">
    ul {
        list-style-type: none;
    }

    .wrapper {
        min-height: 100vh;
        background: grey;
        flex-wrap: wrap;
    }

    .ui.cards {
        padding: 10px;
    }

    .ui.inverted.segment {
        width: 100%;
        position: absolute;
        bottom: 0;
        right: 0;
    }

    @media only screen and (min-width: 1680px) {
        .card.ui {
            width: 30%;
            height: auto;
        }

        .ui.inverted.red.button {
            font-size: 30px;
        }

        li, p {
            font-size: 20px;
        }

        .ui.inverted.segment {
        }
    }

</style>
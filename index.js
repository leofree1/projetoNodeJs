var axios = require("axios");
var express = require("express")
var app = express();

var controleCadastro = {};
var controleUsuario = "";

app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use(express.static(__dirname +'/public'));

app.set('view engine', 'ejs');

app.get("/home", (req, res) => {
    res.render("../views/home", {usuario: controleUsuario});
});

app.get("/cadastro", (req,res) => {
    res.render("../views/cadastro", {usuario: controleUsuario});
});

app.get("/deslogar", (req,res) => {
    controleUsuario = "";
    controleCadastro = {};
    res.render("../views/home", {usuario: controleUsuario});
});

app.get("/comentario", (req,res) => {
    if(!controleCadastro.id) res.render("../views/verificarCadastro", {usuario: controleUsuario});
    else{

        let listaComentarios = [];
        let comentarios;
    
        function buscaComentarios(){
            return axios.post("http://138.68.7.94:85/busca_comentarios")
        }
    
        comentarios = buscaComentarios();
    
        comentarios.then(response =>{
            listaComentarios = response.data.slice(0,100);
            res.render("../views/paginaComentarios", {dadosComentarios : listaComentarios, usuario: controleUsuario})
        })
    }
});

app.post("/cadastrarUsuario", (req,res) => {

    let cadastrarUsuario = {
        email: req.body.email,
        nome: req.body.nome 
    };

    let dadosUsuario;

    function cadastroUsuario(){
        return axios.post("http://138.68.7.94:85/cadastro", cadastrarUsuario)
    }

    dadosUsuario = cadastroUsuario();

    dadosUsuario.then(response => {
        dadosUsuario = response.data;
        controleCadastro = dadosUsuario;
        controleUsuario = controleCadastro.nome.toString();
        res.render("../views/cadastroSucesso", {cadastro : dadosUsuario});
    }).catch(err => {
        if(err)
        {
            res.render("../views/cadastroErro", {erro : err.response.data, usuario: controleUsuario});
        }
    })

});

app.post("/cadastrarComentario", (req,res) => {

    let cadastraComentario = {
        id_usuario: controleCadastro.id,
        comentario: req.body.comentario 
    };

    axios.post("http://138.68.7.94:85/add_comentario", cadastraComentario).then(response => {
        let listaComentarios = [];
        let comentarios;
    
        function buscaComentarios(){
            return axios.post("http://138.68.7.94:85/busca_comentarios")
        }
    
        comentarios = buscaComentarios();
    
        comentarios.then(response =>{
            listaComentarios = response.data.slice(0,100);
            res.render("../views/paginaComentarios", {dadosComentarios : listaComentarios, dadosUsuario: controleCadastro, usuario: controleUsuario})
        })
    }).catch(err => {
        res.render("../views/comentarioErro", {erro : err.response.data}, {usuario: controleUsuario});
    })

});

app.listen(3000, () => {
    console.log("Servidor rodando em localhost:3000/home")
});
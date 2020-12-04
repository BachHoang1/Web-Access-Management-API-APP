const express = require('express')
const app = express()
const { ROLE } = require('./data')
const { authUser, authRole ,specificPath} = require('./basicAuth')
const projectRouter = require('./routes/projects')
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser')
const session = require('express-session')
var path = require('path');

// const tech = require('./views/tech-protected')

const SchemaUser = require("./models/User")
const mongoose = require("mongoose");

const { DB } = require("./config");
const db = mongoose.connection;
mongoose.connect(DB, {
  useFindAndModify: false,
  useUnifiedTopology: true,
  useNewUrlParser: true
});

// app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

app.use('/projects', projectRouter)
app.set("view engine", "ejs")

app.get('/', (req, res) => {
  res.redirect("/login")
})
app.get("/login", (req, res) => {
  if(req.session.userPath!= null)
    return res.redirect(req.session.userPath)

  res.render("login.ejs", { title: 'Login page' });// , loginFail:(req.session.wrongUserId)?"":"class='hidden'"});
});

app.get("/register", (req, res) => {
  res.render("register.ejs", { title: 'Login page' });
});
app.get("/logout", (req, res) => {
  req.session.userId = null
  req.session.userName = null
  req.session.userRole = null
  req.session.userPath = null
  req.session.userSpecific = null
  // console.log(req.session)
  res.redirect(303, '/login?logout=success')
})
app.post("/users/login", (req, res) => {
  console.log(req.session)

  if (!req.session.userId) {
  
    userName = req.body.userName
    password = req.body.userPassword
    console.log({userName,password})
    if (userName == "superuser" && password == "superuser") {
      req.session.userId = "superuser"
      req.session.userName = "superuser"
      req.session.userRole = ROLE.SUPERUSER.roleName
      req.session.userPath = ROLE.SUPERUSER.path

      console.log(ROLE.SUPERUSER.roleName)
      console.log(ROLE.SUPERUSER.path)
      return res.redirect(req.session.userPath)
    }
    else {//for normal user

      SchemaUser.findOne({ username: userName, password: password }, function (err, docs) {
        if (err) {
          console.log(err);
          res.redirect(req.headers.referer)
        }
        if (docs !== null) {
          console.log("login success: here are the information about that account")
          console.log(docs)
          //set all those requirement
          req.session.userId = docs._id
          req.session.userName = docs.username
          req.session.userRole = docs.role
          req.session.userSpecific = docs.path

          for (eachRole in ROLE) {
            if (docs.role === ROLE[eachRole].roleName) {
              req.session.userPath = ROLE[eachRole].path
            }
          }

          console.log("might be bug!: userpath from session:" + req.session.userPath)
          //THIS NEED TO RETURN SINCE IT WILL GO FURTHUR TO THE BELOW LINES
          return res.redirect(req.session.userPath)
        }

        //error or if no USER has found --> redirect to the page
        res.redirect(303, req.headers.referer + "?credential=invalid");
        // res.redirect(req.headers.referer,{title:"test"});

      })
    }
  } else {
    return res.redirect(req.session.userPath)
  }
});

app.post("/users/add", (req, res) => {
  if (req.body.userName === "superuser") {
    res.status(500)
    return res.send("This username is prohibited.")
  }
  console.log({
    _id: (mongoose.Types.ObjectId()).toString().trim(), username: req.body.userName,
    role: req.body.role, password: req.body.password, path: req.body.path
  })
  new SchemaUser({
    _id: (mongoose.Types.ObjectId()).toString().trim(), username: req.body.userName,
    role: req.body.role, password: req.body.password, path: req.body.path
  })
    .save(function (err) {
      if (err) { console.log(err); return err; }
      console.log("success save")

      // //for testing only
      // for (eachRole in ROLE) {
      //   if (req.body.role === ROLE[eachRole].roleName) {
      //     req.session.userPath = ROLE[eachRole].path
      //     return res.redirect(req.session.userPath)
      //   }
      // }
      // return res.redirect('/login')
    });
})

app.get('/superuser', authUser, authRole(ROLE.SUPERUSER), (req, res) => {
  console.log("super user")
  res.render('superuser.ejs')
})

app.get('/admin', authUser, authRole(ROLE.ADMIN), (req, res) => {
  console.log("in admin")
  res.render("support-admin.ejs", { title: "Admin PAGE" })
})
app.get('/admin/manage', authUser, authRole(ROLE.ADMIN), (req, res) => {
  console.log("in admin")
  res.render("support-admin-manage.ejs", { title: "Admin Manage PAGE" })
})
app.get('/admin/help', authUser, authRole(ROLE.ADMIN), (req, res) => {
  console.log("in admin")
  res.render("support-admin-help.ejs", { title: "Admin Help PAGE" })
})
app.get('/admin/assign', authUser, authRole(ROLE.ADMIN), (req, res) => {
  console.log("in admin")
  res.render("support-admin-assign.ejs", { title: "Admin Assign PAGE" })
})
app.get('/hr', authUser, authRole(ROLE.HR), (req, res) => {
  console.log("in hr")
  res.render("hr-admin.ejs", { title: "HR PAGE" })
})
app.get('/tech', authUser, authRole(ROLE.TECH), (req, res) => {
  console.log("in tech")
  res.render("tech-admin.ejs", { title: "Tech PAGE" })
})
app.get('/sales', authUser, authRole(ROLE.SALES), (req, res) => {
  console.log("in sale")
  res.render("sales-admin.ejs", { title: "Sales PAGE" })
})
app.get('/finance', authUser, authRole(ROLE.FINANCE), (req, res) => {
  console.log("in finance")
  res.render("finance-admin.ejs", { title: "Finance PAGE" })
})

app.get('/hr/newhire', authUser, authRole(ROLE.HR),specificPath("/hr/newhire"), (req, res) => {
  console.log("in hr")
  res.render("hr-newhire.ejs", { title: "NEW HIRE PAGE" })
})
app.get('/hr/benefits', authUser, authRole(ROLE.HR),specificPath("/hr/benefits"), (req, res) => {
  console.log("in hr")
  res.render("hr-benefits.ejs", { title: "Benefits PAGE" })
})
app.get('/hr/payroll', authUser, authRole(ROLE.HR),specificPath("/hr/payroll"), (req, res) => {
  console.log("in hr")
  res.render("hr-payroll.ejs", { title: "Payroll PAGE" })
})
app.get('/hr/offboarding', authUser, authRole(ROLE.HR),specificPath("/hr/offboarding"), (req, res) => {
  console.log("in hr")
  res.render("hr-offboarding.ejs", { title: "Off-boarding PAGE" })
})
app.get('/hr/reports', authUser, authRole(ROLE.HR),specificPath("/hr/reports"), (req, res) => {
  console.log("in hr")
  res.render("hr-reports.ejs", { title: "HR Reports PAGE" })
})
app.get('/tech/monitoring', authUser, authRole(ROLE.TECH),specificPath("/tech/monitoring"), (req, res) => {
  console.log("in tech")
  res.render("tech-monitoring.ejs", { title: "Tech Monitoring PAGE" })
})
app.get('/tech/support', authUser, authRole(ROLE.TECH),specificPath('/tech/support'),  (req, res) => {
  console.log("in tech")
  res.render("tech-support.ejs", { title: "Tech Support PAGE" })
})
app.get('/tech/development', authUser, authRole(ROLE.TECH),specificPath('/tech/development'),  (req, res) => {
  console.log("in tech")
  res.render("tech-development.ejs", { title: "Tech Development PAGE" })
})
app.get('/tech/appadmin', authUser, authRole(ROLE.TECH),specificPath('/tech/appadmin'), (req, res) => {
  console.log("in tech")
  res.render("tech-appadmin.ejs", { title: "Tech App Admin PAGE" })
})
app.get('/tech/management', authUser, authRole(ROLE.TECH),specificPath('/tech/management'),  (req, res) => {
  console.log("in tech")
  res.render("tech-management.ejs", { title: "Tech Management PAGE" })
})
app.get('/sales/report', authUser, authRole(ROLE.SALES),specificPath('/sales/report'),  (req, res) => {
  console.log("in sale")
  res.render("sales-admin-report.ejs", { title: "Sales Report PAGE" })
})
app.get('/sales/leads', authUser, authRole(ROLE.SALES),specificPath('/sales/leads'),  (req, res) => {
  console.log("in sale")
  res.render("sales-admin-leads.ejs", { title: "Sales Leads PAGE" })
})
app.get('/sales/demo', authUser, authRole(ROLE.SALES),specificPath('/sales/demo'),  (req, res) => {
  console.log("in sale")
  res.render("sales-admin-demo.ejs", { title: "Sales Demo PAGE" })
})
app.get('/finance/reports', authUser, authRole(ROLE.FINANCE),specificPath('/finance/reports'), (req, res) => {
  console.log("in finance")
  res.render("finance-admin-reports.ejs", { title: "Finance Reports PAGE" })
})
app.get('/finance/payable', authUser, authRole(ROLE.FINANCE),specificPath('/finance/payable'), (req, res) => {
  console.log("in finance")
  res.render("finance-admin-payable.ejs", { title: "Finance Payable PAGE" })
})
app.get('/finance/receivable', authUser, authRole(ROLE.FINANCE),specificPath('/finance/receivable'),  (req, res) => {
  console.log("in finance")
  res.render("finance-admin-receivable.ejs", { title: "Finance Receivable PAGE" })
})
app.get('/finance/tax', authUser, authRole(ROLE.FINANCE),specificPath('/finance/tax'), (req, res) => {
  console.log("in finance")
  res.render("finance-admin-tax.ejs", { title: "Finance Tax PAGE" })
})
/// RETRIEVE DATA
app.get('/get_user_data', (req, res) => {
  console.log("getting user data...")
  SchemaUser.find({}, function (err, docs) {
    if (err) {
      console.log(err);
      res.status(500)
      return res.send("ERROR when access to DB - try again")
    }
    if (docs.length > 0) {
      console.log(docs)
      res.send(docs)
    } else {
      res.send({})
    }
  })
})

app.delete('/delete_user/:id', (req, res) => {
  const { id } = req.params;
  SchemaUser.deleteOne({ _id: id }, function (err) {
    if (err) {
      console.log(err)
    }
  })
  res.send("ok")
})

app.post('/update_user', (req, res) => {
  console.log(req.body)

  const { id, username, password, role ,path} = req.body

  SchemaUser.findOneAndUpdate({ _id: id }, {
    $set: {
      username: username,
      password: password,
      role: role,
      path: path
    }
  }, function (err, res) {
    if (err) {
      console.log(err)
    } 
  });
  console.log("ok")
  res.send("ok")
})

app.listen(3000)
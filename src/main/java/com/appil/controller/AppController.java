package com.appil.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import com.appil.entity.User;
import com.appil.service.UserService;

import jakarta.servlet.http.HttpSession;


@Controller
public class AppController {
	
	@Autowired
	private UserService userService;

	
	@GetMapping("/login")
	public String loginPage() {
		
		return "login";
    }
	
	@GetMapping("/graph")
	public String graphPage() {
		
		return "graph";
    }
	
	
	
	@GetMapping("/checkSession")
	public String checkSession(HttpSession session) {
	  
	    return "sessionCheck";  // This should be a simple view that displays the username
	}

	
	
	@GetMapping("/home")
	public String homePage(jakarta.servlet.http.HttpServletRequest request , HttpSession session) {
		
		try {
            // Retrieve the current Authentication object from the SecurityContext
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            // Check if the authentication object is not null and is authenticated
            if (authentication != null && authentication.isAuthenticated()) {
                // Retrieve the name of the authenticated user
                String name = userService.loadUserByEmail(authentication.getName()).getName();
                // You can also set it as a session attribute if needed
                session.setAttribute("userName", name);
                System.out.println("Authenticated user: " + name);
            } else {
                System.out.println("No authenticated user found.");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

			
	    return "home";  
    }
	
	
	@GetMapping("/learningpage")
	public String learningPage() {
	  
	    return "learningpage";  
	}
	
	@GetMapping("/profile")
	public String profilePage() {
	  
	    return "profile";  
	}
	
	@GetMapping("/modalities")
	public String modalitiesPage() {
	  	    return "modalities";  
	}
	
	@GetMapping("/memory")
	public String memoryPage() {
	  	return "memory";  
	}
	
	@GetMapping("/crossword")
	public String crosswordPage() {
	  	return "crossword";  
	}
	
	@GetMapping("/hangman")
	public String hangmanPage() {
	  	return "hangman";  
	}
	
	@GetMapping("/admindashboard")
	public String madmindashboardPage() {
	  	return "admindashboard";  
	}
	

	
	@GetMapping("/lessons")
	public String lessonsPage() {
	  	return "lessons";  
	}
	
	@GetMapping("/galaxy")
	public String galaxyPage() {
	  	return "galaxy";  
	}
	
	
		
	//LESSONS//
	
	@GetMapping("/lesson1")
	public String lesson1Page() {
	  	return "lesson1";  
	}
	
	@GetMapping("/lesson2")
	public String lesson2Page() {
	  	return "lesson2";  
	}
	
	@GetMapping("/lesson3")
	public String lesson3Page() {
	  	return "lesson3";  
	}
	@GetMapping("/lesson4")
	public String lesson4Page() {
	  	return "lesson4";  
	}
	@GetMapping("/lesson5")
	public String lesson5Page() {
	  	return "lesson5";  
	}
	@GetMapping("/lesson6")
	public String lesson6Page() {
	  	return "lesson6";  
	}
	@GetMapping("/lesson7")
	public String lesson7Page() {
	  	return "lesson7";  
	}
	@GetMapping("/lesson8")
	public String lesson8Page() {
	  	return "lesson8";  
	}
	@GetMapping("/lesson9")
	public String lesson9Page() {
	  	return "lesson9";  
	}
	
	@GetMapping("/lesson10")
	public String lesson10Page() {
	  	return "lesson10";  
	}
	
	
	//////
	
	//ACTIVITIES
	
		
	@GetMapping("/worldcountries")
	public String worldcountriesPage() {
	  	return "worldcountries";  
	}
	
	@GetMapping("/flaggame")
	public String flaggamePage() {
	  	return "flaggame";  
	}
	
	@GetMapping("/pronunciationgame")
	public String pronunciationgamePage() {
	  	return "pronunciationgame";  
	}
	
	@GetMapping("/tobecloze")
	public String tobeclozePage() {
	  	return "tobecloze";  
	}
	
	@GetMapping("/flashcardgame")
	public String flashcardPage() {
	  	return "flashcardgame";  
	}
	
	@GetMapping("/irregularplurals")
	public String irregularpluaralsPage() {
	  	return "irregularplurals";  
	}
	
	@GetMapping("/jobsgame")
	public String jobsgamePage() {
	  	return "jobsgame";  
	}
	
	@GetMapping("/articlesgame")
	public String articlesgamePage() {
	  	return "articlesgame";  
	}
	
	@GetMapping("/verbmatchinggame")
	public String verbmatchinggamePage() {
	  	return "verbmatchinggame";  
	}
	
	@GetMapping("/pastsimplematchinggame")
	public String patsimplematchinggamePage() {
	  	return "pastsimplematchinggame";  
	}
	
	@GetMapping("/gameofgoose")
	public String gameofgoosePage() {
	  	return "gameofgoose";  
	}
	
	@GetMapping("/lesson1-5recap")
	public String lesson15recap() {
	  	return "lesson1-5recap";  
	} 
	
	@GetMapping("/pianoKeyboard")
	public String pianoKeyboard() {
	  	return "pianoKeyboard";  
	} 
	
	
	
	/////
	
	@GetMapping("/hello")
	public String helloPage() {
		return "hello";  
    }
	
	@GetMapping("/privacypolicy")
	public String privacypolicyPage() {
		return "privacypolicy";  
    }
	
	@GetMapping("/terms")
	public String termsPage() {
		return "terms";  
    }
		
		
	@GetMapping("/registration")
    public String showRegistrationForm() {
        return "registration";
    }

    @PostMapping("/registration")
    public String registerUser(
            @RequestParam String name,
            @RequestParam String surname,
            @RequestParam int age,
            @RequestParam String email,
            @RequestParam String psw,
            @RequestParam String pswrepeat,
            Model model) {

        // Validate passwords match
        if (!psw.equals(pswrepeat)) {
            model.addAttribute("error", "Passwords do not match.");
            return "registration";
        }

        // Check if email is already taken
        if (userService.isEmailTaken(email)) {
            model.addAttribute("error", "Email is already taken.");
            return "registration";
        }

        // Create and register the user
        User user = new User();
        user.setName(name);
        user.setSurname(surname);
        user.setAge(age);
        user.setEmail(email);
        user.setPassword(psw);

        userService.registerUser(user);

        return "redirect:/login";
    }

}

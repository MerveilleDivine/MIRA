document.addEventListener("DOMContentLoaded", function() {
    const existingCourseOption = document.getElementById("existing_course");
    const newCourseOption = document.getElementById("new_course");
    const courseNameInput = document.getElementById("course_name");
    const courseDescriptionInput = document.getElementById("course_description");

    // Hide the input fields for new course by default
    courseNameInput.style.display = "none";
    courseDescriptionInput.style.display = "none";

    // Event listener for existing course option
    existingCourseOption.addEventListener("change", function() {
        if (existingCourseOption.checked) {
            // Hide input fields for new course
            courseNameInput.style.display = "none";
            courseDescriptionInput.style.display = "none";
        }
    });

    // Event listener for new course option
    newCourseOption.addEventListener("change", function() {
        if (newCourseOption.checked) {
            // Show input fields for new course
            courseNameInput.style.display = "block";
            courseDescriptionInput.style.display = "block";
        }
    });
});

document.addEventListener("DOMContentLoaded", function() {
    // Function to populate the courses select element
    const populateCourses = function() {
        // Fetch user's courses from the server
        fetch("/user/courses")
            .then(response => response.json())
            .then(data => {
                // Select the courses dropdown element
                const courseSelect = document.getElementById("course");
                // Clear existing options
                courseSelect.innerHTML = "";
                // Iterate over the fetched courses and add them as options
                data.forEach(course => {
                    const option = document.createElement("option");
                    option.value = course.id;
                    option.textContent = course.name;
                    courseSelect.appendChild(option);
                });
            })
            .catch(error => console.error("Error fetching user's courses:", error));
    };

    // Call the function to populate courses dropdown when the page loads
    populateCourses();

    // Event listener for the quiz form submission
    const quizForm = document.getElementById("quiz-form");
    quizForm.addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent default form submission
        // Get form data and convert it to a JSON object
        const formData = new FormData(quizForm);
        const formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });
        // Send the form data to the server to generate the quiz
        fetch("/generate-quiz", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formObject)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Quiz generated successfully:", data);
        })
        .catch(error => console.error("Error generating quiz:", error));
    });
});

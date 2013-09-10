 $(document).ready(function(){
        $('#send_message').click(function(e){
            
            //stop the form from being submitted
            e.preventDefault();
            
            /* declare the variables, var error is the variable that we use on the end
            to determine if there was an error or not */
            var error = false;
            var name = $('#name').val();
            var email = $('#email').val();
            
            var message = $('#message').val();
            
            if(name.length == 0){
                var error = true;
                //$('#name_error').fadeIn(500);
                $('#name').addClass('notcompleted');
                $('#name').attr('placeholder', 'Name is required!');
                $('#name').focus (function(){
                    $(this).removeClass('notcompleted');
                });
            }
            if(email.length == 0 || email.indexOf('@') == '-1'){
                var error = true;
               // $('#email_error').fadeIn(500);
                $('#email').addClass('notcompleted');
                $('#email').attr('placeholder', 'Email is required!');
                $('#email').focus (function(){
                    $(this).removeClass('notcompleted');
                });
            }
            
            if(message.length == 0){
                var error = true;
                $('#message').addClass('notcompleted');
                $('#message').attr('placeholder', 'Please leave us a message!');
                $('#message').focus (function(){
                    $(this).removeClass('notcompleted');
                });
            }
            
            //now when the validation is done we check if the error variable is false (no errors)
            if(error == false){
                //disable the submit button to avoid spamming
                //and change the button text to Sending...
                $('#send_message').attr({'disabled' : 'true', 'value' : 'Sending...' });
                
                /* using the jquery's post(ajax) function and a lifesaver
                function serialize() which gets all the data from the form
                we submit it to send_email.php */
                $.post("send_mail.php", $("#contact_form").serialize(),function(result){
                    //and after the ajax request ends we check the text returned
                    if(result == 'sent'){
                        //if the mail is sent remove the submit paragraph
                         $('#cf_submit_p').remove();
                        //and show the mail success div with fadeIn
                        $('#mail_success').fadeIn(500);
                    }else{
                        //show the mail failed div
                        $('#mail_fail').fadeIn(500);
                        //reenable the submit button by removing attribute disabled and change the text back to Send The Message
                        $('#send_message').removeAttr('disabled').attr('value', 'Send The Message');
                    }
                });
            }
        });    
    });
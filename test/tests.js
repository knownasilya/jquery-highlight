QUnit.test("No options", function( assert ){
    var $test = $('#test1');
    $test.highlight('scurvy');
    assert.ok( $( '.highlight' , $test ).length == 1 , "Ok got 1 highlighted piece of text");
    $test.highlight( [ 'scurvy' , 'angplank' , 'lanyard' ] );
    assert.ok( $( '.highlight' , $test ).length == 3 , "Ok got 3 highlighted pieces of text");
});

QUnit.test("Words only", function( assert ){
    var $test = $('#test2');
    $test.highlight('scurvy' , { wordsOnly: true});
    assert.ok( $( '.highlight' , $test ).length == 1 , "Ok got 1 highlighted piece of text");
    $test.highlight( [ 'scurvy' , 'angplank' , 'lanyard' , 'C#' ] , { wordsOnly: true } );
    assert.ok( $( '.highlight' , $test ).length == 2 , "2 Highlights only");
});

QUnit.test("Case sensitive", function( assert ){
    var $test = $('#test3');
    $test.highlight('Scurvy' , { caseSensitive: true });
    assert.ok( $( '.highlight' , $test ).length == 0 , "No Scurvy");
    $test.highlight('Letter' , { caseSensitive: true });
    assert.ok( $( '.highlight' , $test ).length == 1 , "Found 'Letter' in a case sensitive fashion");
});

QUnit.test("Custom element/class", function( assert ){
    var $test = $('#test4');
    $test.highlight('scurvy' , { element: 'em' , className: 'important'  } );
    assert.ok( $( '.highlight' , $test ).length == 0 , "Ok got 0 higlighted pieces of text with default class");
    assert.ok( $( 'em.important' , $test ).length == 1 , "Ok got 1 higlighted pieces of text with custom class");
});

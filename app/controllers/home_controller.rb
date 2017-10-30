class HomeController < ApplicationController
  before_action :authenticate_user!
  autocomplete :user, :email


  def index
    @page_number = 0
    if params[:page]
        @page_number = params[:page].to_i
    end

    @tweets = current_user.feed page_number: @page_number
    search = params[:search]

    @page_count = current_user.page_count

    if search
      query = "content like '%#{search}%' "
      @tweets = @tweets.where(query)
    end

  end

  def index_tweets
    @page_number = params[:page].to_i
    @tweets = current_user.feed page_number: @page_number
    respond_to do |format|
      format.js{

      }
    end
  end

  def search
    user = User.find_by_email(params[:email])
    return redirect_to user_profile_path(user.id) unless user.nil?
    redirect_to root_path, notice: "No Matches Found!!!!"
  end


  def index_api
    render json: current_user.feed
  end

  def create_tweet
    current_user.tweets.create(content: params[:content])
    return redirect_to '/'
  end

  def create_tweet_json
    tweet = current_user.tweets.create(content: params[:content])
    render json: tweet
  end

  def create_tweet_remote
    @tweet = current_user.tweets.create(content: params[:content])
    respond_to do |format|
      format.js{

      }
    end
  end

  def like
    tweet_id = params[:tweet_id]
    return redirect_to root_path, notice: "You can't like your own tweet!!!" if Tweet.find(tweet_id).user_id == current_user.id
    like = current_user.likes.where(tweet_id: tweet_id).first
    if like
      like.destroy
    else
      current_user.likes.create(tweet_id: tweet_id)
    end

    redirect_to '/'
  end

  def like_tweet_json
    tweet_id = params[:tweet_id]
    like = current_user.likes.where(tweet_id: tweet_id).first
    if like
      like.destroy
      like_state = false
    else
      like = current_user.likes.create(tweet_id: tweet_id)
      like_state = true
    end


    data = Hash.new
    data["tweet_id"] = tweet_id
    data["like"] = like
    data["like_state"] = like_state

    render json: data
  end

  def follow
    followee_id = params[:followee_id]
    follow_mapping = FollowMapping.where(:follower_id => current_user.id, :followee_id => followee_id).first
    unless follow_mapping
      follow_mapping = FollowMapping.create(:follower_id => current_user.id, :followee_id => followee_id)
    else
      follow_mapping.destroy
    end

    return redirect_to user_profile_path(followee_id)
  end

  def users
    @users = User.where('id != ?', current_user.id)
  end

  def followers
    @users = current_user.followers
  end

  def followees
    @users = current_user.followees
  end

  def profile
    email_id = params[:email]
    if params[:id]
      @user = User.find_by_id(params[:id])
    elsif email_id.nil?
      @user = User.find_by_email(email_id)
    end
    return redirect_to root_path, notice: "Invalid User!!!" if @user.nil?
    @tweets = @user.tweets
  end

  def update_picture
  end

  def save_picture
    p = params["profile_picture"]
    new_filename = SecureRandom.hex + "." + p.original_filename.split(".")[1]

    File.open(Rails.root.join('public', 'uploads', new_filename), 'wb') do |file|
      file.write(p.read)
    end

    current_user.profile_picture = new_filename
    current_user.save
    redirect_to user_profile_path(current_user.id)
  end

  def delete_tweet
    tweet = Tweet.find(params[:tweet_id])
    if current_user.admin? || (tweet.user_id == current_user.id) 
      tweet.destroy
    end
    redirect_to '/'
  end

end
